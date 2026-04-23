require 'json'
package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'MakamAudio'
  s.version        = package['version']
  s.summary        = 'Native AVAudioEngine bridge for microtonal Makam audio'
  s.description    = 'AVAudioUnitSampler + MIDI pitch bend for AEU koma-accurate playback. ~5ms latency, offline, no CDN.'
  s.homepage       = 'https://github.com/stibet/musicApp'
  s.license        = { :type => 'MIT' }
  s.authors        = { 'Makam Coach' => 'fatihhanbaysal@gmail.com' }
  s.platform       = :ios, '14.0'
  s.source         = { :path => '.' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files   = '**/*.swift'
  s.frameworks     = 'AVFoundation', 'AudioToolbox', 'CoreAudio'
end
