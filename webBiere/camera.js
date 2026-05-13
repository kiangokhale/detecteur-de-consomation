import {
    FaceDetector,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";

let faceDetector = null;
let cameraOuverte = false;
let detectionFace = false;

const video = document.getElementById('camera');
const bouton = document.getElementById('ouvrirCamera');
const resultats = document.getElementById('resultat');
const image = document.getElementById('image');

bouton.addEventListener('click', ouvrirCamera);

      async function chargerModele() {
        resultats.textContent = "Chargement du modèle...";
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        faceDetector = await FaceDetector.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath:
                    "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite"
            },
            runningMode: "VIDEO"
      });
      resultats.textContent = "Modèle chargé, prêt à détecter les visages.";
      }
      
      async function ouvrirCamera(){
        if(faceDetector === null){
            await chargerModele();
        }
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            })
            video.srcObject = stream;
            cameraOuverte = true;
            resultats.textContent = "Caméra ouverte, en attente de détection...";
            video.addEventListener('loadeddata', detecterVisage);
        }

        function detecterVisage(){
            if(!cameraOuverte){
                return;
            }
            const maitenant = performance.now();
            const detection = faceDetector.detectForVideo(video,maitenant);
            if(detection.detections.length > 0){
                detectionFace = true;
                resultats.textContent = "Visage détecté";
            } else {
                detectionFace = false;
                resultats.textContent = "Aucun visage détecté.";
            }
            requestAnimationFrame(detecterVisage);
            montrerImage();
        }

        function montrerImage(){
            if(detectionFace){
                image.style.display = 'block';
            }else {
                image.style.display = 'none';
            }
        }

