//let DataBase = [];
let  DataCount = [0,0,0,0,0,0,0,0]
const DataBase = ['Shubham','Black Widow', 'Captain America', 'Hawkeye', 'Tony Stark', 'Thor', 'Captain Marvel','unknown']

const video = document.getElementById('videoInput')

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('https://raw.githubusercontent.com/ShubhamKhunt1872003/Face-Recognition-door-lock-using-api-/master/Custom Folder/models/'),
    faceapi.nets.faceLandmark68Net.loadFromUri('https://raw.githubusercontent.com/ShubhamKhunt1872003/Face-Recognition-door-lock-using-api-/master/Custom Folder/models/'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('https://raw.githubusercontent.com/ShubhamKhunt1872003/Face-Recognition-door-lock-using-api-/master/Custom Folder/models/') //heavier/accurate version of tiny face detector
]).then(start)

function start() {
    document.body.append('Models Loaded')
    
    navigator.getUserMedia(
        { video:{} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )
    
   // video.src = 'videos/speech.mp4'
    console.log('video added')
    recognizeFaces()
}

async function recognizeFaces() {

    const labeledDescriptors = await loadLabeledImages()
    console.log(labeledDescriptors)
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.7)


    video.addEventListener('play', async () => {
        console.log('Playing')
        const canvas = faceapi.createCanvasFromMedia(video)
        document.body.append(canvas)

        const displaySize = { width: video.width, height: video.height }
        faceapi.matchDimensions(canvas, displaySize)
        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()
            const resizedDetections = faceapi.resizeResults(detections, displaySize)
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
            const results = resizedDetections.map((d) => {
                return faceMatcher.findBestMatch(d.descriptor)
            })
            results.forEach( (result, i) => {
                const box = resizedDetections[i].detection.box
                if(DataCount.indexOf(5) != -1)
                {
                    console.log("Your good to go");
                }
                DataCount[(DataBase.indexOf(result.toString().split(" ")[0]))]++;
                
            //    // console.log(/^unknown/.test(result.toString()))
               console.log(result.toString())
                const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
                drawBox.draw(canvas)
            })
        }, 100)


        
    })
}


function loadLabeledImages() {
    const labels = ['Shubham','Black Widow', 'Captain America', 'Hawkeye', 'Tony Stark', 'Thor', 'Captain Marvel']
    //const labels = ['Prashant Kumar'] // for WebCam
    return Promise.all(
        labels.map(async (label)=>{
            const descriptions = []
            for(let i=1; i<=2; i++) {
                const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/ShubhamKhunt1872003/Face-Recognition-door-lock-using-api-/master/Custom Folder/labeled_images/${label}/${i}.jpg`)
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                console.log(label + i + JSON.stringify(detections))
                descriptions.push(detections.descriptor)
            }
            document.body.append(label+' Faces Loaded | ')
            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
}