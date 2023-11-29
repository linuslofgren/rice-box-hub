//
//  MeshResource+generateDensePlane.swift
//  RICE
//
//  Created by Linus von Ekensteen Löfgren on 2023-11-29.
//

import Foundation
import RealityKit

extension MeshResource {
    static func generateDensePlane() -> MeshResource? {
        
        var desc = MeshDescriptor(name: "densePlane")
        let width = 10.0
        let depth = 10.0
        let offsetW: Float = -Float(width)/2.0
        let offsetD: Float = 0
        let divisions = 1000
        let numPoints: Int = Int(divisions+1)*Int(divisions+1)
        var positions2: [SIMD3<Float>] = []
        let dx = Float(width)/Float(divisions)
        let dy = Float(depth)/Float(divisions)
        print(dx, dy)
        var ids: [UInt32] = []
        for triId in 0..<numPoints {
            let x = Float(triId % (divisions+1))*dx
            let z = Float((triId - (triId % (divisions+1))) / (divisions + 1))*dy
            
            positions2.append([Float(x + offsetW), 0, -Float(z+offsetD)])
        }
        for triId in 0..<(divisions)*(divisions) {
            
            let rows = Int((triId)/divisions)
            
            
            let points = [UInt32(triId+divisions+1 + rows), UInt32(triId+1+rows), UInt32(triId+rows), UInt32(triId+divisions+1 + rows), UInt32(triId+divisions+1 + rows + 1), UInt32(triId+1+rows)]
            ids.append(contentsOf: points.reversed())
            

            
        }


        desc.positions = MeshBuffers.Positions(positions2)
        desc.primitives = .triangles(ids)
        
        return try? generate(from: [desc])
    }
}

