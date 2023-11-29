//
//  AckData.swift
//  RICE
//
//  Created by Linus von Ekensteen Löfgren on 2023-11-29.
//

import Foundation

struct APIAck: Decodable {
    var type: String
    var jobId: String?
    var result: Float?
    var timestamp: Float?
    var configuration: [Double]
}

