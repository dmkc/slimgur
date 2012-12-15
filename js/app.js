$(document).ready(function(){
    (function(){
        // Primary app UI
        var settings = {
                upload_uri: "https://api.imgur.com/3/image",
                client_id:  "891d1ed77f3ecf4",
                file_list: []
            },

            SUI = Backbone.View.extend({
                el: $("#app"),

                initialize: function() {
                    var that = this;
                    this.uploadInput = $('#upload_input');

                    // Bind drag-dropping of files
                    window.ondragover = function(e) {e.preventDefault()}
                    window.ondrop = function(e) {
                        e.preventDefault();
                        settings.file_list = settings.file_list.concat(e.dataTransfer.files);
                        that.trigger('files:ready');
                    };

                    this.on('files:ready', this.upload, this);
                },

                events: {
                    "click #droparea": "selectFiles",
                    "change #upload_input": "filesSelected"
                },

                selectFiles: function(e){
                    this.uploadInput.trigger('click');
                },
                
                // Triggered when user selects files via upload dialogue
                filesSelected: function(e) {
                    e.preventDefault();
                    var files = this.uploadInput[0].files;

                    for(var i=0; i<files.length;i++) {
                        settings.file_list.push(files[i]); 
                    }

                    console.log('files selected:', this.uploadInput[0].files); 
                    this.trigger('files:ready');
                },

                filesDropped: function(e) {
                },

                upload: function(){
                    while(settings.file_list.length != 0) {
                        var file = settings.file_list.splice(0,1)[0];

                        // Make sure we don't upload non-images
                        if (!file || !file.type.match(/image.*/)) return;

                        // Let's build a FormData object

                        var fd = new FormData();
                        fd.append("image", file); // Append the file

                        var xhr = new XMLHttpRequest();
                        xhr.open("POST", settings.upload_uri);
                        xhr.setRequestHeader('Authorization', 'Client-ID ' + settings.client_id);
                        xhr.onload = function() {
                            var response = JSON.parse(xhr.responseText);
                            console.log('Uploaded. Got some data back:', response);

                            // XXX: Ugly GUI stuff
                            $('#droparea').remove();
                            $('.image_fullscreen').attr('src', response.data.link)
                            $('.url_imgur').val(response.data.link)
                            // emit uploaded event
                        }
                        // XXX error handling
                        xhr.send(fd);
                    }
                }
            });
           
            // Mix in event handling
            _.extend(SUI, Backbone.Events);

            SApp = new SUI;

          // file is from a <input> tag or from Drag'n Drop
          // Is the file an image?
         
        // GUI shit
        $(document).ready(function(){
            var canvas = $('.progress_left')[0],
                context = canvas.getContext("2d"),
                image = $(".image_fullscreen")[0],
                image_ratio = image.width/image.height;

            // Ensure adequate canvas size
            canvas.width  = image.width;
            canvas.height = image.height;

            /*
            context.drawImage(image, 0, 0);

            // Render the image black and white
            var imgd = context.getImageData(0, 0, 
                          image.width, 
                          image.height),

                pix = imgd.data,
                luminosity = 0, i=0;

            // Set each pixel to luminosity
            for (i = 0, n = pix.length; i < n; i += 4) {
                luminosity = pix[i] * .3 + pix[i+1] * .6 + 
                    pix[i+2] * .10;
                pix[i] = pix[i+1] = pix[i+2] = luminosity;
            }

            context.putImageData(imgd, 0, 0);
            */

            $('.image').click(function(){
                var $this = $(this);
                $this.toggleClass('flipped');

                $this.find('.url_imgur').select();
            });

            var Image = {
                settings : {
                    src: '',
                    uri: '',
                    binary_string: '',
                },

                upload: function() {}
            }
        });
    })();
});
