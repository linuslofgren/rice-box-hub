//
//  geoMod.metal
//  RICE
//
//  Created by Linus von Ekensteen Löfgren on 2023-07-14.
//

#include <metal_stdlib>
#include <RealityKit/RealityKit.h>
#include <metal_math>

using namespace metal;


float strength(float3 pos, float time_arg, float4 inp) {
    
    float displacements[10] = {0,0,0,0,0,0,0,0,0,0};
    
    float first = floor(inp.x/100);
    float second = floor(inp.x/10)-first*10;
    float third = inp.x-first*100-second*10;
    displacements[0] = first;
    displacements[1] = second;
    displacements[2] = third;
    
    float forth = floor(inp.y/100);
    float fifth = floor(inp.y/10)-forth*10;
    float sixth = inp.y-forth*100-fifth*10;
    displacements[3] = forth;
    displacements[4] = fifth;
    displacements[5] = sixth;
    
    float seventh = floor(inp.z/100);
    float eigth = floor(inp.z/10)-seventh*10;
    float ninth = inp.z-seventh*100-eigth*10;
    displacements[6] = seventh;
    displacements[7] = eigth;
    displacements[8] = ninth;
    
    displacements[9] = inp.w;
    
    float l = 0.125;
    float total = 0.0;
    int numberOfSources = 10;
    float width = 0.06;
    for(int i = 0; float(i) < 10; i++) {
        for(int j = 0; j < numberOfSources; j++) {
            // displacements[i]/100*2
            float dist = distance(pos, float3(width*float(9-i)+width/(float(numberOfSources))*float(j),0,0));
            // float dist = distance(pos, float3(l/4*float(i),0,i*0.3));
            total += sin((2 * 3.1415 * (dist + 2 * displacements[i]/100))/l - time_arg)/float(numberOfSources);
        }
    }
    
    return total;
}

float dist(float3 pos, float4 inp) {
    
    float displacements[10] = {0,0,0,0,0,0,0,0,0,0};
    
    float first = floor(inp.x/100);
    float second = floor(inp.x/10)-first*10;
    float third = inp.x-first*100-second*10;
    displacements[0] = first;
    displacements[1] = second;
    displacements[2] = third;
    
    float forth = floor(inp.y/100);
    float fifth = floor(inp.y/10)-forth*10;
    float sixth = inp.y-forth*100-fifth*10;
    displacements[3] = forth;
    displacements[4] = fifth;
    displacements[5] = sixth;
    
    float seventh = floor(inp.z/100);
    float eigth = floor(inp.z/10)-seventh*10;
    float ninth = inp.z-seventh*100-eigth*10;
    displacements[6] = seventh;
    displacements[7] = eigth;
    displacements[8] = ninth;
    
    displacements[9] = inp.w;
    
    float l = 0.3;
    float total = 100000.0;
    for(int i = 0; float(i) < 10; i++) {
        float dist = distance(pos, float3(l/4*float(9-i),0,displacements[i]/100));
        total = min(dist, total);
    }
    
    return total;
}

[[visible]]
void geoMod(realitykit::geometry_parameters params)
{
    float maxOffset = 10;
    float offset = strength(params.geometry().model_position(), params.uniforms().time(), params.uniforms().custom_parameter());
    params.geometry().set_model_position_offset(params.geometry().normal() * (offset/maxOffset)*0.5);
}

[[visible]]
void pSurface(realitykit::surface_parameters params) {
    auto surface = params.surface();
    
    float dx = params.geometry().world_position().x*100;
    float dz = params.geometry().world_position().z*100;
    if (abs(fmod(dx, float(2))) < 0.2 && abs(fmod(dz, float(2))) < 0.2) {
        surface.set_base_color(half3(0.1, 0.1, 0.1));
    } else {
        surface.set_base_color(half3(0.5, 0.5, 0.5));
    }
    float s = abs(params.geometry().model_position().y);
    surface.set_opacity(max(s*10, 0.4));
    surface.set_emissive_color(half3(s, 0.2, 1-s));
    
    
    
}
