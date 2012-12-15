$(document).ready(function(){
    (function(){
        // Some globals
        var settings = {
                upload_uri: "https://api.imgur.com/3/image",
                client_id:  "891d1ed77f3ecf4",
                file_list: []
            },

        // Model for a single image
            ImageModel = Backbone.Model.extend({
                defaults: {
                    // `File` object for this image
                    fileObject: undefined,
                    // empty data URL == needs a thumbnail
                    dataURL: '',

                    response: {
                        status: 0,
                        deletehash: '',
                        id: '',
                        link: ''
                    }
                },

                sync: function(){}
            }),


            ImageCollection = Backbone.Collection.extend({
                model: ImageModel,
                sync: function(){}

            }),

        // Initialize the image collection
            Images = new ImageCollection,

        // A view for a single image 
            ImageView = Backbone.View.extend({
                template: _.template($('#image_template').html()),
                events: {
                    "click": "flipCard"
                },

                initialize: function() {
                    this.listenTo(this.model, 'change', this.render);
                    this.on('thumbnail:dataready', this.initProgressMeter, this);
                },

                render: function() {
                    if(this.$el.children().length === 0) {
                        this.$el.html(this.template(this.model.toJSON()));
                    }

                    this.$el.addClass('image');
                    this.imageLarge  = this.$('.image_fullscreen');
                    this.thumbnail = this.$('.thumb');

                    this.imageLarge.attr('src', this.model.get('dataURL'));
                    //this.input = this.$('.edit');
                    return this;
                },

                initProgressMeter: function() {
                    var canvas = this.$('.progress_left')[0],
                        context = canvas.getContext("2d"),
                        image = this.$(".image_fullscreen")[0],
                        image_ratio = image.width/image.height;

                    // Ensure adequate canvas size
                    canvas.width  = image.width;
                    canvas.height = image.height;

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
                },

                flipCard: function() {
                    this.$el.toggleClass('flipped');
                }
            }),

            App = Backbone.View.extend({
                el: $("#app"),

                events: {
                    "click #droparea": "selectFiles",
                    "change #upload_input": "filesSelected"
                },


                initialize: function() {
                    var that = this;

                    this.uploadInput = $('#upload_input');
                    this.droparea = $('#droparea');
                    this.gallery = $('#gallery');

                    // Bind to drag and drop events
                    window.ondragover = function(e) {e.preventDefault()}
                    window.ondrop = function(e) {
                        e.preventDefault();
                        that.trigger('files:dropped', e);
                    };

                    this.on('files:dropped', this.filesDropped, this);

                    this.listenTo(Images, 'add', this.imageAdded);
                },


                // Callback for when the user has selected or dragged
                // new files and they are ready to be uploaded
                filesReady: function() {
                    var files = _.clone(settings.file_list), file;

                    while( settings.file_list.length != 0 ) {
                        file = files.splice(0,1)[0]; 
                    }
                },

                // Upload all files in the settings.file_list array
                upload: function(){
                    while(settings.file_list.length != 0) {
                        var file = settings.file_list.splice(0,1)[0];

                        // Make sure we don't upload non-images
                        if (!file || !file.type.match(/image.*/)) return;

                        // Build a formdata object
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
                },
                
                // CALLBACKS AND UTILITIES 
                imageAdded: function(image) {
                    console.log('New image added to collection', image);

                    var view = new ImageView({model: image}),
                        fr = new FileReader(),
                        that = this;
                    
                    fr.onloadend = function() {
                        image.set({
                            dataURL: fr.result
                        });
                        view.trigger('thumbnail:dataready')
                    }

                    fr.readAsDataURL(image.get('fileObject'));
                    this.gallery.append(view.render().el);
                },

                thumbnailDone: function(image) {
                    console.log('Thumbnail done');
                },

                // Open browser file upload dialogue
                selectFiles: function(e){
                    this.uploadInput.trigger('click');
                },
                
                // Callback for files selected using browser file dialogue
                filesSelected: function(e) {
                    var files = this.uploadInput[0].files;

                    e.preventDefault();
                    this.addFiles(files);

                    console.log('Added some files:', files); 
                },

                // Callback for files flying in via drag and drop
                filesDropped: function(e) {
                    console.log("File dropped", e);
                    this.addFiles(e.dataTransfer.files);
                    this.upload();
                },

                // Add files to the array of files to be uploaded
                addFiles: function(files) {
                    for(var i=0; i<files.length; i++) {
                        Images.create({ fileObject: files[i] }); 
                    }
                }
            });
           
            // Mix in event handling
            _.extend(App, Backbone.Events);

            window.Slimgur = new App;
            window.Images  = Images;
    })();
});
