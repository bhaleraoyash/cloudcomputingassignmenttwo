function searchPhoto() {
  var apigClient = apigClientFactory.newClient();
  var user_message = document.getElementById('note-textarea').value;
  var body = {};
  var params = { 'q': user_message };

  if(params['q']==""){
    alert("No Search Query Found. Enter keyword to Search!");
  }

  var additionalParams = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  apigClient
    .searchGet(params, body, additionalParams)
    .then(function (res) {
      var data = {};
      var data_array = [];
      resp_data = res.data;
      length_of_response = resp_data.length;

      var photosDiv = document.getElementById("img-container");
      photosDiv.innerHTML = "";

      if (length_of_response == 0) {
        photosDiv.innerHTML = '<h2 style="text-align: center;font-size: 25px;font-style: bold;margin-top:30px;">Sorry, we did not find any images for those labels</h2>';
      }
      else {
        photosDiv.innerHTML = '<h2 style="text-align: center;font-size: 25px;font-style: bold;margin-top:30px;margin-bottom:30px; color: white;">Here is what we found : </h2>';
        image_paths = res["data"];
        for (n = 0; n < image_paths.length; n++) {
          images_list = image_paths[n].split('/');
          imageName = images_list[images_list.length - 1];
          photosDiv.innerHTML += '<figure><img src="https://cloudassignmenttwo.s3.amazonaws.com/' + image_paths[n] + '" style="width:25%"><figcaption>' + imageName + '</figcaption></figure>';
        }
      }
    })
    .catch(function (result) {});
}

window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition

function voiceSearch(){
    if ('SpeechRecognition' in window) {
        console.log("SpeechRecognition is Working");
    } else {
        console.log("SpeechRecognition is Not Working");
    }
    
    var inputSearchQuery = document.getElementById("note-textarea");
    const recognition = new window.SpeechRecognition();
    //recognition.continuous = true;

    micButton = document.getElementById("mic_search");  
    
    if (micButton.innerHTML == "mic") {
        recognition.start();
    } else if (micButton.innerHTML == "mic_off"){
        recognition.stop();
    }

    recognition.addEventListener("start", function() {
        micButton.innerHTML = "mic_off";
        console.log("Recording.....");
    });

    recognition.addEventListener("end", function() {
        console.log("Stopping recording.");
        micButton.innerHTML = "mic";
    });

    recognition.addEventListener("result", resultOfSpeechRecognition);
    function resultOfSpeechRecognition(event) {
        const current = event.resultIndex;
        transcript = event.results[current][0].transcript;
        inputSearchQuery.value = transcript;
        console.log("transcript : ", transcript)
    }
}

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let encoded = reader.result.replace(/^data:(.*;base64,)?/, '');
      if (encoded.length % 4 > 0) {
        encoded += '='.repeat(4 - (encoded.length % 4));
      }
      resolve(encoded);
    };
    reader.onerror = (error) => reject(error);
  });
}

function uploadPhoto() {
  var filePath = (document.getElementById('file_path').value).split("\\");
  var file = document.getElementById('file_path').files[0];
  const reader = new FileReader();
  console.log(filePath);
  if ((filePath == "") || (!['png', 'jpg', 'jpeg'].includes(filePath.toString().split(".")[1]))) {
        alert("Please upload a valid .png/.jpg/.jpeg file!");
  }
  else {
    let config = {
      headers:{'Content-Type': file.type,'x-amz-meta-customLabels': custom_labels.value}
    };

    url = 'https://8plos60pul.execute-api.us-east-1.amazonaws.com/v1/upload/cloudassignmenttwo/' + file.name
    axios.put(url,file,config).then(response=>{
      alert("Upload successful!!");
    })
  }
}