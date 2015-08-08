
    if (window.File && window.FileReader && window.FileList && window.Blob) {
    } else {
      alert('The File APIs are not fully supported in this browser.');
    }

    function handleFileSelectSimple(evt) {
        var files = evt.target.files; // FileList object
        var output = [];
        for (var i = 0, f; f = files[i]; i++) {
            output.push('<li><strong>', escape(f.name), '</strong>', '</li>');
            var reader = new FileReader();
            reader.onload = (function(theFile) {
                return function(e) {
                    var span = document.createElement('span');
                    span.innerHTML = ['<audio src="', e.target.result, '"/>'].join('');
                    document.getElementById('list').insertBefore(span, null);
                    var succes = document.createElement('span');
                    succes.innerHTML = ['<p>Файл загружен </p>'].join('');
                    document.getElementById('list').insertBefore(succes, null);
                    ID3.loadTags(e.target.result, function() {
                        var tags = ID3.getAllTags(e.target.result);
                        var tagToSpan = document.createElement('div');
                        tagToSpan.className = "meta-data";
                        tagToSpan.innerHTML = "Исполнитель: " + tags.artist + "<br> Название: " + tags.title + "<br> Альбом: " + tags.album;
                        document.getElementById('list').appendChild(tagToSpan);
                    });
                };
            })(f);
            reader.readAsDataURL(f);
            console.log(f);
        }
        document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
    }

    document.getElementById('files').addEventListener('change', handleFileSelectSimple, false);
    
    
    function handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var files = evt.dataTransfer.files; // FileList object.
        var output = [];
        for (var i = 0, f; f = files[i]; i++) {
            if (!f.type.match('audio.*')) {
                continue;
            }
            output.push('<li><strong>', escape(f.name), '</strong>', '</li>');
            var reader = new FileReader();
            reader.onload = (function(theFile) {
                return function(e) {
                    var span = document.createElement('span');
                    span.innerHTML = ['<audio src="', e.target.result, '"/>'].join('');
                    document.getElementById('list').insertBefore(span, null);
                    var succes = document.createElement('span');
                    succes.innerHTML = ['<p>Файл загружен </p>'].join('');
                    document.getElementById('list').insertBefore(succes, null);
                    ID3.loadTags(e.target.result, function() {
                        var tags = ID3.getAllTags(e.target.result);
                        var tagToSpan = document.createElement('div');
                        tagToSpan.className = "meta-data";
                        tagToSpan.innerHTML = "Исполнитель: " + tags.artist + "<br> Название: " + tags.title + "<br> Альбом: " + tags.album;
                        document.getElementById('list').appendChild(tagToSpan);
                    });

                };
            })(f);
            reader.readAsDataURL(f);
            console.log(f);
        }
        document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
        
    }

    function handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy';
    }

    var dropZone = document.getElementById('drop_zone');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);


    var localAudioPlayer = function () {
        window.AudioContext = window.AudioContext||window.webkitAudioContext;
        var audioContext = new AudioContext();
        console.log(document.querySelector('audio'));
        var myAudio = document.querySelector('audio');
        console.log('MyAudio=');
        console.log(myAudio);
        var source = audioContext.createMediaElementSource(myAudio);
        var audioScript = audioContext.createScriptProcessor(512);
        source.connect(audioScript);
        source.connect(audioContext.destination);
        audioScript.connect(audioContext.destination);
        console.log(source);

        document.getElementById('play').style.display = 'inline-block';
        document.getElementById('stop').style.display = 'inline-block';
        document.getElementById('equalizer').style.display = 'block';
        function playSound() {
            myAudio.play();
        }

        function stopSound() {
            myAudio.pause();
            myAudio.load();
        }
        document.querySelector('.play').addEventListener('click', playSound);
        document.querySelector('.stop').addEventListener('click', stopSound);

        var analyser = audioContext.createAnalyser();
        var distortion = audioContext.createWaveShaper();
        var biquadFilter = audioContext.createBiquadFilter();
        var convolver = audioContext.createConvolver();
        var gainNode = audioContext.createGain();
        gainNode.gain.value = 0.8;
        analyser.minDecibels = -90;
        analyser.maxDecibels = -10;
        analyser.smoothingTimeConstant = 0.85;

        var canvas = document.querySelector('.visualizer');
        console.log(canvas);
        var canvasCtx = canvas.getContext("2d");

        var intendedWidth = document.querySelector('.visual').clientWidth;

        canvas.setAttribute('width',intendedWidth);

        var createFilter = function (frequency) {
            var filter = audioContext.createBiquadFilter();
            filter.type = 'peaking';
            filter.frequency.value = frequency;
            filter.gain.value = 0;
            filter.Q.value = 1;
            return filter;
        };
        var createFilters = function () {
            var frequencies = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000],
            filters = frequencies.map(createFilter);
            var connectGraph = function(){
                source.connect(analyser);
                analyser.connect(distortion);
                distortion.connect(biquadFilter);
                biquadFilter.connect(convolver);
                convolver.connect(filters[0]);
                filters[0].connect(filters[1]);
                filters[1].connect(filters[2]);
                filters[2].connect(filters[3]);
                filters[3].connect(filters[4]);
                filters[4].connect(filters[5]);
                filters[5].connect(filters[6]);
                filters[6].connect(filters[7]);
                filters[7].connect(filters[8]);
                filters[8].connect(filters[9]);
                filters[9].connect(gainNode);
                gainNode.connect(audioContext.destination);
            }
            
            function changeFilter(){
               var pop = document.getElementsByName('eq').item(0).checked,
                    rock = document.getElementsByName('eq').item(1).checked,
                    jazz = document.getElementsByName('eq').item(2).checked,
                    classic = document.getElementsByName('eq').item(3).checked,
                    normal = document.getElementsByName('eq').item(4).checked;


                if (pop == true){
                    filters[0].gain.value = -3;
                    filters[1].gain.value = 2;
                    filters[2].gain.value = 4;
                    filters[3].gain.value = 5;
                    filters[4].gain.value = 4;
                    filters[5].gain.value = -2;
                    filters[6].gain.value = -3;
                    filters[7].gain.value = -3;
                    filters[8].gain.value = -3;
                    filters[9].gain.value = -3;
                    console.log('pop');
                }   else if(rock == true){
                    filters[0].gain.value = 4;
                    filters[1].gain.value = 2;
                    filters[2].gain.value = -2;
                    filters[3].gain.value = -5;
                    filters[4].gain.value = -2;
                    filters[5].gain.value = 2;
                    filters[6].gain.value = 5;
                    filters[7].gain.value = 6;
                    filters[8].gain.value = 6;
                    filters[9].gain.value = 6;
                    console.log('rock');
                } else if(jazz == true){
                    filters[0].gain.value = -2;
                    filters[1].gain.value = 5;
                    filters[2].gain.value = -8;
                    filters[3].gain.value = 0;
                    filters[4].gain.value = 8;
                    filters[5].gain.value = 7;
                    filters[6].gain.value = 6;
                    filters[7].gain.value = 0;
                    filters[8].gain.value = 0;
                    filters[9].gain.value = 0;
                    
                    console.log('jazz');
                } else if(classic == true){
                    filters[0].gain.value = 0;
                    filters[1].gain.value = 0;
                    filters[2].gain.value = 0;
                    filters[3].gain.value = 0;
                    filters[4].gain.value = 0;
                    filters[5].gain.value = 0;
                    filters[6].gain.value = -5;
                    filters[7].gain.value = -5;
                    filters[8].gain.value = -5;
                    filters[9].gain.value = -6;
                    
                    console.log('class');
                } else if(normal == true){
                    filters[0].gain.value = 0;
                    filters[1].gain.value = 0;
                    filters[2].gain.value = 0;
                    filters[3].gain.value = 0;
                    filters[4].gain.value = 0;
                    filters[5].gain.value = 0;
                    filters[6].gain.value = 0;
                    filters[7].gain.value = 0;
                    filters[8].gain.value = 0;
                    filters[9].gain.value = 0;
                    console.log('normal');

                } 
            }
            for(i=0;i<document.getElementsByName('eq').length;i++){
                document.getElementsByName('eq').item(i).addEventListener('change', changeFilter);
            } 
            connectGraph();
            console.log(filters);
        };

        createFilters();
        visualize();

        function visualize() {
            WIDTH = canvas.width;
            HEIGHT = canvas.height;

            analyser.fftSize = 2048;
            var bufferLength = analyser.fftSize;
            console.log(bufferLength);
            var dataArray = new Uint8Array(bufferLength);

            canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

            function draw() {

                drawVisual = requestAnimationFrame(draw);

                analyser.getByteTimeDomainData(dataArray);

                canvasCtx.fillStyle = 'rgb(249, 255, 170)';
                canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

                canvasCtx.lineWidth = 2;
                canvasCtx.strokeStyle = 'rgb(244, 48, 48)';

                canvasCtx.beginPath();

                var sliceWidth = WIDTH * 1.0 / bufferLength;
                var x = 0;

                for(var i = 0; i < bufferLength; i++) {

                    var v = dataArray[i] / 128.0;
                    var y = v * HEIGHT/2;

                    if(i === 0) {
                        canvasCtx.moveTo(x, y);
                    } else {
                        canvasCtx.lineTo(x, y);
                    }

                    x += sliceWidth;
                }
                canvasCtx.lineTo(canvas.width, canvas.height/2);
                canvasCtx.stroke();
            };
            draw();
            console.log('Проброс выполнен');
        }
    };


