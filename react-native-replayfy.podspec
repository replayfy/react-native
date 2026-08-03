require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-replayfy"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = "https://replayfy.app"
  s.license      = { :type => "MIT", :file => "LICENSE" }
  s.authors      = { "Nasirudeen Olohundare" => "iamnasirudeen@gmail.com" }
  s.platforms    = { :ios => "15.0" }
  s.source       = { :git => "https://github.com/replayfy/react-native.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.swift_version = "5.0"

  # React Native core (bridge, UIManager, promise blocks).
  s.dependency "React-Core"
  # The native iOS SDK that does the real recording. For local development
  # the example app points this at ../.. via a :path pod entry.
  s.dependency "Replay"
end
