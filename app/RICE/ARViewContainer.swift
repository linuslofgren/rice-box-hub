//
//  ARViewContainer.swift
//  RICE
//
//  Created by Linus von Ekensteen Löfgren on 2023-11-29.
//

import SwiftUI
import ARKit
import RealityKit
import Starscream

struct ARViewContainer: UIViewRepresentable {
    
    @Binding var tx: Position
    @Binding var rx: Position
    @Binding var ris: Position
    @Binding var url: URL?
    var number: Int
    
    func makeCoordinator() -> Coordinator {
        Coordinator(parent: self)
    }
    
    class Coordinator: NSObject, ARSessionDelegate, WebSocketDelegate {
        var parent: ARViewContainer
        var arView: ARView!
        var waveModel: ModelEntity?
        var socket: WebSocket?
        var risEntiry: Entity?
        var imageAnchorToEntity: [ARImageAnchor: Entity] = [:]
        
        init(parent: ARViewContainer) {
            self.parent = parent
        }
        
        func didReceive(event: Starscream.WebSocketEvent, client: Starscream.WebSocket) {
            print(event)
            switch event {
            case .text(let string):
                print(string)
                do {
                    let ackData = try JSONDecoder().decode(APIAck.self, from: string.data(using: .utf8)!)
                    guard ackData.type == "ris_position_ack" else { return }
                    if let waveModel = waveModel, var material = waveModel.model?.materials.first as? CustomMaterial {
                        var toMilli = ackData.configuration.map{Int(floor($0*100))}
                        toMilli = toMilli.map{$0 > 9 ? 9 : $0}
                        let first = toMilli[0]*100 + toMilli[1]*10 + toMilli[2]
                        let second = toMilli[3]*100 + toMilli[4]*10 + toMilli[5]
                        let third = toMilli[6]*100 + toMilli[7]*10 + toMilli[8]
                        let forth = toMilli[9]
                        material.custom.value = SIMD4(x: Float(first), y: Float(second), z: Float(third), w: Float(forth))
                        waveModel.model!.materials = [material]
                    }
                } catch {
                    print("Faulty websocket")
                }
                
            default: break
            }
        }
        
        func session(_ session: ARSession, didAdd anchors: [ARAnchor]) {
            for anchor in anchors {
                guard let imageAnchor = anchor as? ARImageAnchor else {return}
                let waveAnchor = AnchorEntity()
                waveAnchor.transform.matrix = imageAnchor.transform
                arView.scene.addAnchor(waveAnchor)
                
                let width = Float(imageAnchor.referenceImage.physicalSize.width * 1.03)
                let height = Float(imageAnchor.referenceImage.physicalSize.height * 1.03)
                let boxMesh = MeshResource.generatePlane(width: width, depth: height, cornerRadius: 0.3)
                let boxMaterial = SimpleMaterial(color: .blue, isMetallic: false)

                let boxEntity = ModelEntity(mesh: boxMesh, materials: [boxMaterial])
                let xM = ModelEntity(mesh: .generateText("X", extrusionDepth: 0.01, font: .boldSystemFont(ofSize: 0.04), alignment: .natural, lineBreakMode: .byWordWrapping))
                xM.transform.translation = SIMD3(SCNVector3(x: 0.1, y: 0.0, z: 0))
                
                let yM = ModelEntity(mesh: .generateText("Y", extrusionDepth: 0.01, font: .boldSystemFont(ofSize: 0.04), alignment: .natural, lineBreakMode: .byWordWrapping))
                yM.transform.translation = SIMD3(SCNVector3(x: 0.0, y: 0.1, z: 0))
                
                let zM = ModelEntity(mesh: .generateText("Z", extrusionDepth: 0.01, font: .boldSystemFont(ofSize: 0.04), alignment: .natural, lineBreakMode: .byWordWrapping))
                zM.transform.translation = SIMD3(SCNVector3(x: 0.0, y: 0.0, z: 0.1))
                
                print(boxEntity.position)
                
                waveAnchor.addChild(boxEntity)
                waveAnchor.addChild(xM)
                waveAnchor.addChild(yM)
                waveAnchor.addChild(zM)
                
                // Keep ris level with floor
                if imageAnchor.referenceImage.name == "ris", let wave = self.waveModel {
                    wave.transform.rotation = waveAnchor.transform.rotation.inverse
                    let e = waveAnchor.transform.matrix.eulerAngles
                    wave.transform.rotation *= simd_quatf(angle: e.y, axis: SIMD3<Float>(0,1,0))
                    waveAnchor.addChild(wave)
                }
                self.imageAnchorToEntity[imageAnchor] = waveAnchor
            }
        }
        
        func sendPosition(name: String, x: Float, y: Float) {
            if let socket = socket {
                let str = "{\"type\": \"position_update\", \"object\": \""+name+"\", \"position\": {\"x\": " + String(x) + ", \"y\": " + String(y) + "}}"
                print(str)
                socket.write(string: str)
            }
            
        }
        
        func session(_ session: ARSession, didUpdate anchors: [ARAnchor]) {
            for anchor in anchors {
                guard let imageAnchor = anchor as? ARImageAnchor else {return}
                let anchorEntity = imageAnchorToEntity[imageAnchor]
                anchorEntity?.transform.matrix = imageAnchor.transform
                if imageAnchor.referenceImage.name == "ris", let wave = self.waveModel, let anchorEntity=anchorEntity  {
                    risEntiry = anchorEntity
                    
                    let forwardDirection = anchorEntity.transform.matrix.columns.2
                    let projectedVector = SIMD3<Float>(forwardDirection.x, 0, forwardDirection.z)
                    let normalizedVector = normalize(projectedVector)
                    var rotationAroundYAxis = atan2(normalizedVector.x, normalizedVector.z)
                    
                    if rotationAroundYAxis < 0 {
                        rotationAroundYAxis += 2 * .pi
                    }
                    wave.transform.rotation = anchorEntity.transform.rotation.inverse
                    wave.transform.rotation *= simd_quatf(angle: rotationAroundYAxis - .pi/2, axis: SIMD3<Float>(0,1,0))
                    
                }
                if let waveModel, let anchorEntity {
                    let anchorPosition = anchorEntity.convert(position: SIMD3(repeating: .zero), to: waveModel)
                    
                    let x = anchorPosition.x
                    let z = anchorPosition.z
                    
                    if let name = imageAnchor.referenceImage.name {
                        sendPosition(name: name, x: x, y: z)
                    }
                    
                    if imageAnchor.referenceImage.name == "ris" {
                        DispatchQueue.main.async {
                            self.parent.ris.x = x
                            self.parent.ris.y = z
                        }
                    } else if imageAnchor.referenceImage.name == "rx" {
                        DispatchQueue.main.async {
                            self.parent.rx.x = x
                            self.parent.rx.y = z
                        }
                    } else {
                        DispatchQueue.main.async {
                            self.parent.tx.x = x
                            self.parent.tx.y = z
                        }
                    }
                }
            }
        }
    }
    
    func connectSocket(context: Context, url: URL) {
        var request = URLRequest(url: url)
        request.timeoutInterval = 5
        
        if let socket = context.coordinator.socket {
            socket.disconnect()
            socket.forceDisconnect()
        }
        
        context.coordinator.socket = WebSocket(request: request)
        context.coordinator.socket?.delegate = context.coordinator
        context.coordinator.socket?.connect()
    }
    
    func makeUIView(context: Context) -> ARView {
        if let url = url {
            connectSocket(context: context, url: url)
        }
        
        
        let library = MTLCreateSystemDefaultDevice()!.makeDefaultLibrary()!
        let geometryModifier = CustomMaterial.GeometryModifier(named: "geoMod", in: library)
        let surfaceShader = CustomMaterial.SurfaceShader(named: "pSurface", in: library)
        
        guard
            let mesh = MeshResource.generateDensePlane(),
            let material = try? CustomMaterial(surfaceShader: surfaceShader, geometryModifier: geometryModifier, lightingModel: .lit)
        else {
            fatalError("Could not create plane model.")
        }
        
        context.coordinator.waveModel = ModelEntity(mesh: mesh, materials: [material])
        
        guard let referenceImages = ARReferenceImage.referenceImages(inGroupNamed: "AR Resources", bundle: nil) else {
            fatalError("Missing expected asset catalog resources.")
        }
        
        let arView = ARView(frame: .zero)
        context.coordinator.arView = arView
        arView.session.delegate = context.coordinator
        
        let configuation = ARWorldTrackingConfiguration()
        configuation.planeDetection = .horizontal
        configuation.isAutoFocusEnabled = true
        
        configuation.detectionImages = referenceImages
        configuation.maximumNumberOfTrackedImages = 3
        configuation.frameSemantics.insert(.personSegmentationWithDepth)
        arView.session.run(configuation)

        return arView
        
    }
    
    func updateUIView(_ uiView: ARView, context: Context) {
        if let url = url {
            connectSocket(context: context, url: url)
        }
    }
    
}
