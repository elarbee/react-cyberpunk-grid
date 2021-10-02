import React, {useEffect, useRef, useState} from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import './GridLandscape.css';
import {PerlinMatrix} from './LandscapeUtils';



const GridLandscape = ({gridSize = 50, noiseFactor = 20, noiseStepSize = 0.5, gridColor = '#d6ffd6', showDebug=false}) => {
    const PERLIN_MATRIX = new PerlinMatrix(gridSize, noiseFactor, noiseStepSize);

    const setupScene = (canvas, setDebugInfo) => {
        const coords = PERLIN_MATRIX.buildPerlinMatrix3D();
        let scene = new THREE.Scene();
        let camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

        camera.position.z = 1;

        const renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize( window.innerWidth, window.innerHeight );
        canvas.current.appendChild(renderer.domElement);

        const controls = new OrbitControls( camera, renderer.domElement );

        animate({renderer, scene, camera,controls, setDebugInfo, coords, step:0, rows: [], cols: []});
    };

    const createCurve = (coords) => {
        const vertices = coords.map(c =>  new THREE.Vector3( c.x, c.y, c.z /3));
        const curve = new THREE.CatmullRomCurve3( vertices);

        const points = curve.getPoints( 100 );
        const geometry = new THREE.BufferGeometry().setFromPoints( points );

        const material = new THREE.LineBasicMaterial( { color : gridColor } );

        return new THREE.Line( geometry, material );
    };

    const logCamera = (camera, log) => {
        log(JSON.stringify(camera.rotation));
    };

    const animate = (props) => {
        const {
            renderer,
            scene,
            camera,
            controls,
            setDebugInfo,
            coords,
            step,
            rows,
            cols
        } = props;

        // Remove old rows/cols
        rows.forEach(r => {
            r.geometry.dispose();
            r.material.dispose();
            scene.remove(r);
        });
        cols.forEach(c => {
            c.geometry.dispose();
            c.material.dispose();
            scene.remove(c);
        });
        // Shift matrix
        const newCoords = PERLIN_MATRIX.shiftNoiseXY(coords, step/32);

        if(showDebug){
            // Log camera position and update cam controls
            logCamera(camera, setDebugInfo);
            controls.update();
        }

        //--------
        const newRows = [];
        PERLIN_MATRIX.forEachRow(coords, r => newRows.push(createCurve(r)));
        newRows.forEach(r => scene.add(r));

        const newCols = [];
        PERLIN_MATRIX.forEachCol(coords, r => newCols.push(createCurve(r)));
        newCols.forEach(c => scene.add(c));

        renderer.render( scene, camera );

        const newProps = {
            renderer,
            scene,
            camera,
            controls,
            setDebugInfo,
            coords: newCoords,
            step:step+1,
            rows: newRows,
            cols: newCols,
        };
        requestAnimationFrame( () => animate(newProps) );
    };

    const canvas = useRef();
    const [debugInfo, setDebugInfo] = useState('');
    //eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect((() => setupScene(canvas, setDebugInfo)), [])
    return (
        <>
            <div ref={canvas}/>
            {showDebug &&
            <p className='debug'>{debugInfo}</p>
            }
        </>
        );
}

export default GridLandscape;
