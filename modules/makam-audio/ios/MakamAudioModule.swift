import ExpoModulesCore
import AVFoundation

// MIDI channel count — supports up to 4 simultaneous notes with different pitch bends
private let kChannelCount = 4
// Pitch bend range in semitones (±4 = ±400 cents, covers all AEU offsets)
private let kPitchBendSemitones: Double = 4.0

public class MakamAudioModule: Module {
  private var engine = AVAudioEngine()
  private var samplers: [Int: AVAudioUnitSampler] = [:]
  private var reverb = AVAudioUnitReverb()
  private var engineReady = false

  public func definition() -> ModuleDefinition {
    Name("MakamAudio")

    AsyncFunction("prepare") { [weak self] (promise: Promise) in
      DispatchQueue.global(qos: .userInitiated).async {
        do {
          try self?.setupEngine()
          promise.resolve(nil)
        } catch {
          promise.reject("AUDIO_SETUP_FAILED", error.localizedDescription)
        }
      }
    }

    Function("playNote") { [weak self] (
      midiNote: Int, velocity: Int, durationMs: Double,
      centOffset: Double, channel: Int
    ) in
      guard let self, self.engineReady else { return }
      let ch = UInt8(max(0, min(channel, kChannelCount - 1)))
      guard let sampler = self.samplers[Int(ch)] else { return }
      self.applyPitchBend(sampler: sampler, centOffset: centOffset, channel: ch)
      sampler.startNote(UInt8(max(0, min(127, midiNote))),
                        withVelocity: UInt8(max(0, min(127, velocity))),
                        onChannel: ch)
      if durationMs > 0 {
        DispatchQueue.main.asyncAfter(deadline: .now() + durationMs / 1000.0) { [weak sampler] in
          sampler?.stopNote(UInt8(midiNote), onChannel: ch)
          sampler?.sendPitchBend(8192, onChannel: ch)
        }
      }
    }

    Function("stopNote") { [weak self] (midiNote: Int, channel: Int) in
      let ch = UInt8(max(0, min(channel, kChannelCount - 1)))
      self?.samplers[Int(ch)]?.stopNote(UInt8(midiNote), onChannel: ch)
    }

    Function("setInstrument") { [weak self] (gmProgram: Int, channel: Int) in
      guard let self, self.engineReady else { return }
      let ch = UInt8(max(0, min(channel, kChannelCount - 1)))
      // Bank 0 = GM melodic, MSB 0x79 (GM)
      self.samplers[Int(ch)]?.sendProgramChange(UInt8(gmProgram), bankMSB: 0x79, bankLSB: 0, onChannel: ch)
    }

    Function("setReverb") { [weak self] (wetLevel: Float) in
      // wetDryMix: 0 (dry) … 100 (wet)
      self?.reverb.wetDryMix = max(0, min(100, wetLevel * 100))
    }

    Function("isReady") { [weak self] () -> Bool in
      return self?.engineReady ?? false
    }
  }

  // MARK: – Engine Setup

  private func setupEngine() throws {
    // Build graph: samplers → reverb → output
    engine.attach(reverb)
    reverb.loadFactoryPreset(.plate)
    reverb.wetDryMix = 20

    for ch in 0 ..< kChannelCount {
      let sampler = AVAudioUnitSampler()
      engine.attach(sampler)
      engine.connect(sampler, to: reverb, format: nil)
      samplers[ch] = sampler
    }

    let outputFormat = engine.mainMixerNode.outputFormat(forBus: 0)
    engine.connect(reverb, to: engine.mainMixerNode, format: outputFormat)

    try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
    try AVAudioSession.sharedInstance().setActive(true)
    try engine.start()

    // Load built-in GM soundfont
    for (ch, sampler) in samplers {
      try loadGMSoundfont(sampler: sampler, channel: UInt8(ch))
      setPitchBendRange(sampler: sampler, channel: UInt8(ch))
    }

    engineReady = true
  }

  private func loadGMSoundfont(sampler: AVAudioUnitSampler, channel: UInt8) throws {
    // Try bundled SF2 first; fall back to built-in GM bank
    if let sf2URL = Bundle.main.url(forResource: "GeneralUser_GS", withExtension: "sf2") {
      // Clarinet = program 71, bank 0
      try sampler.loadSoundBankInstrument(at: sf2URL, program: 71, bankMSB: 0x79, bankLSB: 0)
    } else {
      // Built-in iOS DLS / GM bank
      let appleSF2Paths = [
        "/System/Library/Components/CoreAudio.component/Contents/Resources/gs_instruments.dls",
        "/Library/Audio/Sounds/Banks/gs_instruments.dls",
      ]
      for path in appleSF2Paths {
        if FileManager.default.fileExists(atPath: path) {
          let url = URL(fileURLWithPath: path)
          try? sampler.loadSoundBankInstrument(at: url, program: 71, bankMSB: 0x79, bankLSB: 0)
          break
        }
      }
    }
  }

  // Set pitch bend range via MIDI RPN 0 (Pitch Bend Sensitivity)
  private func setPitchBendRange(sampler: AVAudioUnitSampler, channel: UInt8) {
    let semitones = UInt8(Int(kPitchBendSemitones))
    sampler.sendController(101, withValue: 0, onChannel: channel)  // RPN MSB
    sampler.sendController(100, withValue: 0, onChannel: channel)  // RPN LSB (select PB range)
    sampler.sendController(6,   withValue: semitones, onChannel: channel) // Data Entry MSB = range
    sampler.sendController(38,  withValue: 0, onChannel: channel)  // Data Entry LSB
    sampler.sendController(101, withValue: 127, onChannel: channel) // Null RPN
    sampler.sendController(100, withValue: 127, onChannel: channel)
    sampler.sendPitchBend(8192, onChannel: channel) // Reset to center
  }

  // Apply MIDI pitch bend for centOffset
  // Range: ±(kPitchBendSemitones * 100) cents mapped to 0…16383 (center = 8192)
  private func applyPitchBend(sampler: AVAudioUnitSampler, centOffset: Double, channel: UInt8) {
    let maxCents = kPitchBendSemitones * 100.0
    let clampedOffset = max(-maxCents, min(maxCents, centOffset))
    let bendValue = Int(8192.0 + clampedOffset * 8192.0 / maxCents)
    sampler.sendPitchBend(UInt16(max(0, min(16383, bendValue))), onChannel: channel)
  }
}
