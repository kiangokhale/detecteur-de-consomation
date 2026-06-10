import {
    FaceLandmarker,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";

let faceLandmarker = null;
let cameraOuverte = false;

let detectionFace = false;

let yeuxOuverts = false;
let boucheOuverte = false;
let sourire = false;

const video = document.getElementById('camera');
const bouton = document.getElementById('ouvrirCamera');
const resultats = document.getElementById('resultat');
const image = document.getElementById('image');

bouton.addEventListener('click', ouvrirCamera);

      async function chargerModele() {
        resultats.textContent = "Chargement du modèle...";
        //charger fichier pour faire charger media pipe
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm" 
        );
        //cree le modele de detection de visage avec les options, comme video,
        //  unee seul face, les blendshapes(eye left, eye right, jaw open) et la confiance de detection (au moin a 50% de confiance)
        faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath:
                   "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task"
            },
            runningMode: "VIDEO",
            numFaces: 1,
            outputFaceBlendshapes: true,
            minFaceDetectionConfidence: 0.5
      });
      resultats.textContent = "Modèle chargé";
      }
      
      async function ouvrirCamera(){
        if(faceLandmarker == null){
            await chargerModele();
        }
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            })
            //met image de la camera dans la video
            video.srcObject = stream;
            cameraOuverte = true;
            resultats.textContent = "Caméra ouverte...";
            //quand la video est chargé, on lance la detection
            video.addEventListener('loadeddata', detecter);
        }

        function detecter(){
            if(!cameraOuverte){
                return;
            }

            const maitenant = performance.now(); //temp actuelle pour la detection
            const detection = faceLandmarker.detectForVideo(video,maitenant);
            //detectForVideo detecte le visage dans la video et retourne les resultats de la detection


            if(detection.faceLandmarks.length > 0){ //si un visage est detecté longuweur de la detection est superieur a 0
                detectionFace = true;
                const blendshapes = detection.faceBlendshapes[0].categories;
                 //chercher expression du visage a la position 0 (le premier visage detecté)
                 //blendshapes contient les scores de chaque expression du visage, comme eyeBlinkLeft, eyeBlinkRight, jawOpen, etc.
                 //getScore est une fonction qui cherche le score d'une expression du visage dans les blendshapes
                 //plus le score est haut, plus l'expression est prononcée
                 //par exemple, si eyeBlinkLeft est haut, cela signifie que l'oeil gauche est fermé
                 //si jawOpen est haut, cela signifie que la bouche est ouverte

                const eyeBlinkLeft = getScore(blendshapes, "eyeBlinkLeft");
                const eyeBlinkRight = getScore(blendshapes, "eyeBlinkRight");
                const jawOpen = getScore(blendshapes, "jawOpen");
                const smileLeft = getScore(blendshapes, "mouthSmileLeft");
                const smileRight = getScore(blendshapes, "mouthSmileRight");
                // Plus eyeBlink est haut, plus l'oeil est fermé
                yeuxOuverts = eyeBlinkLeft < 0.4 && eyeBlinkRight < 0.4;
                //donc si petit, les yeux sont ouverts, si grand, les yeux sont fermés

                sourire = smileLeft > 0.4 && smileRight > 0.4; // Plus smile est haut, plus le sourire est prononcé

                // Plus jawOpen est haut, plus la bouche est ouverte
                boucheOuverte = jawOpen > 0.35;

                resultats.textContent =
                "Visage détecté | Yeux : " +
                (yeuxOuverts ? "ouverts" : "fermés") +
                 " | Bouche : " +
                (boucheOuverte ? "ouverte" : "fermée") + 
                    " | Sourire : " + 
                    (sourire ? "oui" : "non");

            } else {
                detectionFace = false;
                yeuxOuverts = false;
            boucheOuverte = false;
            sourire = false;

            resultats.textContent = "Aucun visage détecté.";
            }
            requestAnimationFrame(detecter);//bloucle infinie pour continuer a detecter le visage dans la video
            montrerImage();
        }
        function getScore(blendshapes, nom) {
        return blendshapes.find(b => b.categoryName === nom)?.score ?? 0;
}

        function montrerImage(){
            if(detectionFace && yeuxOuverts && boucheOuverte && sourire){
                image.style.display = 'block';
            }else {
                image.style.display = 'none';
            }
        }

