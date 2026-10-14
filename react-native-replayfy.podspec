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
  # The native iOS SDK that does the real recording — published to CocoaPods
  # trunk as "Replayfy". For local development the example app overrides this
  # with a :path pod entry pointing at the sibling SDK checkout. 0.0.5 is the
  # first release that keeps frames across background/resume and respects
  # recordScreen:false, excluded screens and pauses after a return. 0.0.7
  # masks password, card-number and one-time-code fields on its own, paints
  # masks solid by default and applies the dashboard's "always mask input
  # values".
  s.dependency "Replayfy", ">= 0.0.7"
  # Replayfy is a static framework (it links PLCrashReporter's static
  # xcframework), and a pod that depends on one must be static too, or an app
  # whose Podfile uses `use_frameworks!` fails to install.
  s.static_framework = true
end
