/*
See LICENSE folder for this sample’s licensing information.

Abstract:
Main view controller for the AR experience.
*/

import ARKit
import SceneKit
import UIKit

class ViewController: UIViewController, ARSCNViewDelegate {
    
    @IBOutlet var sceneView: ARSCNView!
    
    var risNode: SCNNode?
    var targetNode: SCNNode?
    var rxNode: SCNNode?
    var oldCylinder: SCNNode?
    var oldRxCylinder: SCNNode?
    
    @IBOutlet weak var blurView: UIVisualEffectView!
    
//    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
//        sceneView.hitTest(touches.first?.location(in: sceneView), options: [.ignoreHiddenNodes]
//    }
    
    /// The view controller that displays the status and "restart experience" UI.
    lazy var statusViewController: StatusViewController = {
        return children.lazy.compactMap({ $0 as? StatusViewController }).first!
    }()
    
    /// A serial queue for thread safety when modifying the SceneKit node graph.
    let updateQueue = DispatchQueue(label: Bundle.main.bundleIdentifier! +
        ".serialSceneKitQueue")
    
    /// Convenience accessor for the session owned by ARSCNView.
    var session: ARSession {
        return sceneView.session
    }
    
    // MARK: - View Controller Life Cycle
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        sceneView.delegate = self
        sceneView.session.delegate = self
        
        sceneView.autoenablesDefaultLighting = true
        sceneView.automaticallyUpdatesLighting = true

        // Hook up status view controller callback(s).
        statusViewController.restartExperienceHandler = { [unowned self] in
            self.restartExperience()
        }
    }

	override func viewDidAppear(_ animated: Bool) {
		super.viewDidAppear(animated)
		
		// Prevent the screen from being dimmed to avoid interuppting the AR experience.
		UIApplication.shared.isIdleTimerDisabled = true
        
        

        // Start the AR experience
        resetTracking()
	}
	
	override func viewWillDisappear(_ animated: Bool) {
		super.viewWillDisappear(animated)

        session.pause()
	}

    // MARK: - Session management (Image detection setup)
    
    /// Prevents restarting the session while a restart is in progress.
    var isRestartAvailable = true
    
    func renderer(_ renderer: SCNSceneRenderer, updateAtTime time: TimeInterval) {
        
    }
    
    func renderer(_ renderer: SCNSceneRenderer, didRenderScene scene: SCNScene, atTime time: TimeInterval) {
        updateQueue.async {
            
            self.oldCylinder?.geometry?.firstMaterial?.diffuse.contents = UIColor(hue: 0.8, saturation: 0.8, brightness: 1.0, alpha: (time.truncatingRemainder(dividingBy: 1000.0))/1000.0)
        }
    }
    
    /// Creates a new AR configuration to run on the `session`.
    /// - Tag: ARReferenceImage-Loading
	func resetTracking() {
        
        guard let referenceImages = ARReferenceImage.referenceImages(inGroupNamed: "AR Resources", bundle: nil) else {
            fatalError("Missing expected asset catalog resources.")
        }
        
        let configuration = ARWorldTrackingConfiguration()
        configuration.detectionImages = referenceImages
        configuration.maximumNumberOfTrackedImages = 4
        configuration.environmentTexturing = .automatic
//        sceneView.autoenablesDefaultLighting = true
        configuration.isLightEstimationEnabled = true
        session.run(configuration, options: [.resetTracking, .removeExistingAnchors])

        statusViewController.scheduleMessage("Look around to detect images", inSeconds: 7.5, messageType: .contentPlacement)
	}
    
    func renderer(_ renderer: SCNSceneRenderer, didUpdate node: SCNNode, for anchor: ARAnchor) {
        
        guard let imageAnchor = anchor as? ARImageAnchor else { return }
        let referenceImage = imageAnchor.referenceImage
        let imageName = referenceImage.name ?? ""
//        print(imageName)
//        print(node.position)
        guard let risNode else {return}
        print(risNode.worldPosition.x)
        print(risNode.worldPosition.y)
        
        guard let targetNode, let rxNode else {return}
        let cylinderLineNode = SCNGeometry.cylinderLine(from: targetNode.position,
                                                        to: risNode.position,
                                                            segments: 3)
        
        guard var oldCylinder else {
            self.oldCylinder = cylinderLineNode
            sceneView.scene.rootNode.addChildNode(cylinderLineNode)
            
            return
        }
        self.oldCylinder?.removeFromParentNode()
        sceneView.scene.rootNode.addChildNode(cylinderLineNode)
        self.oldCylinder = cylinderLineNode
        
        let cylinderLineNodeRx = SCNGeometry.cylinderLine(from: rxNode.position,
                                                        to: risNode.position,
                                                            segments: 3)
        
        guard var oldRxCylinder else {
            self.oldRxCylinder = cylinderLineNodeRx
            sceneView.scene.rootNode.addChildNode(cylinderLineNodeRx)
            
            return
        }
        self.oldRxCylinder?.removeFromParentNode()
        sceneView.scene.rootNode.addChildNode(cylinderLineNodeRx)
        self.oldRxCylinder = cylinderLineNodeRx
//        print(self.oldCylinder?.geometry?.firstMaterial?.diffuse.contents)
//        let a = (sin(CACurrentMediaTime()*40)+2)/2
//        print(CACurrentMediaTime())
//        print(a)
//        self.oldCylinder?.geometry?.firstMaterial?.diffuse.contents = UIColor(hue: 0.5, saturation: 0.8, brightness: 0.8, alpha: a)
        self.oldRxCylinder?.geometry?.firstMaterial?.diffuse.contents = UIColor(hue: 0.1, saturation: 0.8, brightness: 0.8, alpha: 1.0)
    }

    // MARK: - ARSCNViewDelegate (Image detection results)
    /// - Tag: ARImageAnchor-Visualizing
    func renderer(_ renderer: SCNSceneRenderer, didAdd node: SCNNode, for anchor: ARAnchor) {
        guard let imageAnchor = anchor as? ARImageAnchor else { return }
        let referenceImage = imageAnchor.referenceImage
        updateQueue.async {
            
            // Create a plane to visualize the initial position of the detected image.
            let plane = SCNPlane(width: referenceImage.physicalSize.width,
                                 height: referenceImage.physicalSize.height)
            let planeNode = SCNNode(geometry: plane)
            planeNode.geometry?.materials.first?.diffuse.contents = UIImage(named: "overlay")
            planeNode.opacity = 0.25
            
            /*
             `SCNPlane` is vertically oriented in its local coordinate space, but
             `ARImageAnchor` assumes the image is horizontal in its local space, so
             rotate the plane to match.
             */
            planeNode.eulerAngles.x = -.pi / 2
            planeNode.opacity = 0.5
            
            /*
             Image anchors are not tracked after initial detection, so create an
             animation that limits the duration for which the plane visualization appears.
             */
            planeNode.runAction(self.imageHighlightAction)
            
            let box = SCNBox(width: referenceImage.physicalSize.width, height: referenceImage.physicalSize.height, length: 0.1, chamferRadius: 0)
            let boxNode = SCNNode(geometry: box)
            boxNode.position = SCNVector3(0,0,0.1)
            
            
            
            
            // Add the plane visualization to the scene.
            node.addChildNode(planeNode)
            let imageName = referenceImage.name ?? ""
            
            let risName = "iPad Pro 12.9-inch"
            if imageName == risName {
                self.risNode = node
                let urlPath = Bundle.main.url(forResource: "risbox", withExtension: "scn")!
                let referenceNode = SCNReferenceNode(url: urlPath)!
                referenceNode.load()
                
                let sp = SCNNode(geometry: SCNSphere(radius: 0.1))
                sp.position = SCNVector3(0,0,0.1)
//                sp.eulerAngles.y = .pi / 2
    //            planeNode.addChildNode(boxNode)
                node.addChildNode(referenceNode)
            } else if imageName == "source" {
                self.targetNode = node
                let urlPath = Bundle.main.url(forResource: "antenna", withExtension: "scn")!
                let referenceNode = SCNReferenceNode(url: urlPath)!
                referenceNode.load()
                
                let sp = SCNNode(geometry: SCNSphere(radius: 0.1))
                sp.position = SCNVector3(0,0,0.1)
                
    //            planeNode.addChildNode(boxNode)
                node.addChildNode(referenceNode)
            } else if imageName == "rx" {
                self.rxNode = node
                let urlPath = Bundle.main.url(forResource: "antenna", withExtension: "scn")!
                let referenceNode = SCNReferenceNode(url: urlPath)!
                referenceNode.load()
                
                let sp = SCNNode(geometry: SCNSphere(radius: 0.1))
                sp.position = SCNVector3(0,0,0.1)
                
    //            planeNode.addChildNode(boxNode)
                node.addChildNode(referenceNode)
            }
        }

        DispatchQueue.main.async {
            let imageName = referenceImage.name ?? ""
            self.statusViewController.cancelAllScheduledMessages()
            self.statusViewController.showMessage("Detected image “\(imageName)”")
        }
    }

    var imageHighlightAction: SCNAction {
        return .sequence([
            .wait(duration: 0.25),
            .fadeOpacity(to: 0.85, duration: 0.25),
            .fadeOpacity(to: 0.15, duration: 0.25),
            .fadeOpacity(to: 1.0, duration: 0.25),
//            .fadeOut(duration: 0.5),
//            .removeFromParentNode()
        ])
    }
}


extension SCNGeometry {

    class func cylinderLine(from: SCNVector3,
                              to: SCNVector3,
                        segments: Int) -> SCNNode {

        let yOffset: Float = 0.1
        let x1 = from.x
        let x2 = to.x

        let y1 = from.y + yOffset
        let y2 = to.y + yOffset

        let z1 = from.z
        let z2 = to.z

        let distance =  sqrtf( (x2-x1) * (x2-x1) +
                               (y2-y1) * (y2-y1) +
                               (z2-z1) * (z2-z1) )

        let cylinder = SCNCylinder(radius: 0.005,
                                   height: CGFloat(distance))

        cylinder.radialSegmentCount = segments

        cylinder.firstMaterial?.diffuse.contents = UIColor.green

        let lineNode = SCNNode(geometry: cylinder)

        lineNode.position = SCNVector3(x: (from.x + to.x) / 2,
                                       y: (from.y + yOffset + to.y + yOffset) / 2,
                                       z: (from.z + to.z) / 2)

        lineNode.eulerAngles = SCNVector3(Float.pi / 2,
                                          acos((to.z-from.z)/distance),
                                          atan2((to.y-from.y),(to.x-from.x)))

        return lineNode
    }
}
