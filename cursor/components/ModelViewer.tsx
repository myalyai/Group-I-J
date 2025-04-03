import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import html2canvas from 'html2canvas';

interface ModelViewerProps {
  file: File;
  onScreenshot: (base64: string) => void;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ file, onScreenshot }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup with darker background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a); // Darker gray background

    // Camera setup with better positioning
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 10);

    // Enhanced renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // Improved lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(-5, 5, -5);
    scene.add(backLight);

    // Controls setup with enhanced rotation capabilities
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.enableRotate = true;
    controls.rotateSpeed = 1.0;
    controls.enableZoom = true;
    controls.zoomSpeed = 1.2;
    controls.minDistance = 2;
    controls.maxDistance = 20;
    controls.enablePan = true;
    controls.panSpeed = 1.0;
    controls.autoRotate = false; // Enable this if you want automatic rotation

    // Load STL with improved material
    const loader = new STLLoader();
    const fileUrl = URL.createObjectURL(file);
    
    loader.load(fileUrl, (geometry) => {
      const material = new THREE.MeshPhysicalMaterial({
        color: 0x2194ce,
        metalness: 0.2,
        roughness: 0.4,
        clearcoat: 0.3,
        clearcoatRoughness: 0.3,
        reflectivity: 0.5,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Center and scale the model
      geometry.computeBoundingBox();
      const boundingBox = geometry.boundingBox!;
      const center = boundingBox.getCenter(new THREE.Vector3());
      geometry.center();

      const maxDim = Math.max(
        boundingBox.max.x - boundingBox.min.x,
        boundingBox.max.y - boundingBox.min.y,
        boundingBox.max.z - boundingBox.min.z
      );
      const scale = 5 / maxDim;
      mesh.scale.set(scale, scale, scale);

      scene.add(mesh);
      setIsLoading(false);
      URL.revokeObjectURL(fileUrl);

      // Initial camera position based on model size
      camera.position.z = maxDim * 2;
      controls.update();
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [file]);

  const takeScreenshot = async () => {
    if (!containerRef.current) return;
    
    try {
      const canvas = await html2canvas(containerRef.current, {
        scale: 2, // Increase resolution
        backgroundColor: '#f5f5f5',
        logging: false,
        useCORS: true
      });
      const base64 = canvas.toDataURL('image/png', 1.0); // Maximum quality
      onScreenshot(base64);
    } catch (error) {
      console.error('Error taking screenshot:', error);
    }
  };

  return (
    <div className="relative w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <div className="text-lg">Loading model...</div>
        </div>
      )}
      <button
        onClick={takeScreenshot}
        className="absolute bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
      >
        Take Screenshot
      </button>
    </div>
  );
};

export default ModelViewer;