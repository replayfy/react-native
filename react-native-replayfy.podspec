require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-replayfy"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = "https://replayfy.app"
  s.license      = { :type => "BSD-3-Clause", :file => "LICENSE" }
  s.authors      = { "Nasirudeen Olohundare" => "iamnasirudeen@gmail.com" }
  s.platforms    = { :ios => "15.0" }
  s.source       = { :git => "https://github.com/replayfy/react-native.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.swift_version = "5.0"

  # React Native core (bridge, UIManager, promise blocks).
  s.dependency "React-Core"
  # The native iOS SDK that does the real recording — published to CocoaPods
  # trunk as "Replayfy". For local development the example app overrides this
  # with a :path pod entry pointing at the sibling SDK checkout.
  s.dependency "Replayfy"
end
