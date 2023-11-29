import SwiftUI
import ARKit
import RealityKit
import Starscream

struct ContentView: View {
    @State private var tx: Position = Position(x: 0.0, y: 0.0)
    @State private var rx: Position = Position(x: 0.0, y: 0.0)
    @State private var ris: Position = Position(x: 0.0, y: 0.0)
    @State private var number: Int = 1
    @State private var url: URL? = URL(string: "ws://192.168.255.6:8080/")
    @State private var showDetails = false
    var ris_target = Target(image: "ris", offset: SCNVector3(x: 0.0, y: 10.0, z: 0.0))
    var tx_target = Target(image: "tx", offset: SCNVector3(x: 0.0, y: 10.0, z: 0.0))
    var rx_target = Target(image: "rx", offset: SCNVector3(x: 0.0, y: 10.0, z: 0.0))

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            ARViewContainer(tx: $tx, rx: $rx, ris: $ris, url: $url, number: number)
                .ignoresSafeArea()

            Button("URL") {
                withAnimation {
                    self.showDetails.toggle()
                }
            }.padding()
                .background()
                .clipShape(RoundedRectangle(cornerRadius: 8))
                .padding()
            if showDetails {
                VStack {
                    Text(url?.absoluteString ?? "-")
                    TextField("URL", value: $url, format: .url)
                        .keyboardType(.URL)
                        .textContentType(.URL)
                        .disableAutocorrection(true)
                        .autocapitalization(.none)
               
                }
                .padding()
                .background(.white)
                .clipShape(RoundedRectangle(cornerRadius: 8))
                .frame(width: 200, height: 200)
                .padding()
                
                
            }
        }.transition(.slide)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}


