import {
    FaceDetector,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/task-vision@latest";

let faceDetector = null;
let cameraOuverte = false;

const video = document.getElementById('camera');
const bouton = document.getElementById('ouvrirCamera');
const reslutats = document.getElementById('resultats');

bouton.addEventListener('click', ouvrirCamera);

      async function chargerModele() {
        resultats.textContent = "Chargement du modèle...";
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        faceDectector = await FaceDetector.createFromOptions(vision, {
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
                resultats.textContent = `Visage détecté avec une confiance de ${Math.round(detection.detections[0].categories[0].score * 100)}%`;
            } else {
                resultats.textContent = "Aucun visage détecté.";
            }
            requestAnimationFrame(detecterVisage);
        }
