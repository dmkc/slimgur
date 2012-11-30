// Controller for an image
(function(){
    $(document).ready(function(){
        var canvas = $('.progress_left')[0],
  	        context = canvas.getContext("2d"),
  	        image = $(".image_fullscreen")[0],
            image_ratio = image.width/image.height,
            canvas_dimensions = {
                width: image.width,
                height: image.height
            }

        // Ensure adequate canvas size
        canvas.width = canvas_dimensions.width;
        canvas.height = canvas_dimensions.height;

  	    context.drawImage(image, 0, 0);

        // Render the image black and white
        var imgd = context.getImageData(0, 0, 
                      canvas_dimensions.width, 
                      canvas_dimensions.height),

            pix = imgd.data,
            luminosity = 0, i=0;

        // Set each pixel to luminosity
        for (i = 0, n = pix.length; i < n; i += 4) {
            luminosity = pix[i] * .3 + pix[i+1] * .6 + 
                pix[i+2] * .10;
            pix[i] = pix[i+1] = pix[i+2] = luminosity;
  	    }

  	    context.putImageData(imgd, 0, 0);

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
