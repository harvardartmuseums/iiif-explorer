function dragMoveListener (event) {
  var target = event.target,
      // keep the dragged position in the data-x/data-y attributes
      x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
      y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

  // translate the element
  target.style.webkitTransform =
  target.style.transform =
    'translate(' + x + 'px, ' + y + 'px)';

  // update the posiion attributes
  target.setAttribute('data-x', x);
  target.setAttribute('data-y', y);
}


function makeImageContainer(image, id) {
  var multiplier = image.scalefactor;

  var verticesToPolygonPoints = function(d) {
      return d.boundingPoly.vertices.map(function(d) {return [d.x*multiplier,d.y*multiplier].join(",");}).join(" ");
    };

  var showFaceDetails = function(d) {
      d3.select("#face-metrics")
          .style("visibility", "visible")
          .style("left", (d.boundingPoly.vertices[1].x*d.multiplier) + 2 + "px")
          .style("top", (d.boundingPoly.vertices[1].y*d.multiplier) + "px");
      d3.select("span.metric-surpriseLikelihood").text(d.surpriseLikelihood);
      d3.select("span.metric-joyLikelihood").text(d.joyLikelihood);
      d3.select("span.metric-sorrowLikelihood").text(d.sorrowLikelihood);
      d3.select("span.metric-angerLikelihood").text(d.angerLikelihood);
      d3.select("span.metric-headwearLikelihood").text(d.headwearLikelihood);
      d3.select("span.metric-blurredLikelihood").text(d.blurredLikelihood);
      d3.select("span.metric-underExposedLikelihood").text(d.underExposedLikelihood);
    };

  var hideFaceDetails = function(d) {
          d3.select("#face-metrics").style("visibility", "hidden");
        };

  // Create the container for this object
  var container = $("<div/>", {
              "id": "container-" + id,
              "class": "image-container"  
            });

  // Create the bounding box layer
  var svgContainer = d3.select($(container).get(0)).append("svg")
          .attr("id", "annotations-" + id)
          .attr("class", "annotations")
                    .attr("width", 1024)
                    .attr("height", 1024);

  // Create the mask layer
  var mask = $("<div/>", {
              "id": "mask-" + id,
              "class": "mask"
            });
  $(container).append(mask);

  // Create the regions layer
  var regions = $("<div/>", {
            "id": "regions-" + id,
            "class": "regions"
            });
  $(container).append(regions);

  // Create the full image background layer
  $(container).append($("<img/>", {
              "id": "background-" + id,
              "class": "background"})
              .attr("src", image.baseimageurl + "?width=1024&height=1024"));

  if (image.googlevision) {
    if (image.googlevision.responses[0]) {
      var faceAnnotations = image.googlevision.responses[0].faceAnnotations; 
      if (faceAnnotations) {

        //draw the annotations on the annotation layer
        var faceGroup = svgContainer.append("g")
                  .attr("id", "facegroup-" + id);

        var faceBoxes = faceGroup.selectAll("polygon")
                    .data(faceAnnotations)
                    .enter()
                    .append("polygon");

        faceBoxes.attr("points", verticesToPolygonPoints)
                                  .attr("stroke", "blue")
                                  .attr("stroke-width", 2)
                                  .attr("fill", "none")
                                  .attr("pointer-events", "visible")
                                  .on("mouseout", hideFaceDetails)
                                  .on("mouseover", showFaceDetails);

        faceAnnotations.forEach(function(d, i) {
          var left = (d.boundingPoly.vertices[0].x * multiplier);
          var top = (d.boundingPoly.vertices[0].y * multiplier);
          var width = ((d.boundingPoly.vertices[1].x - d.boundingPoly.vertices[0].x) * multiplier) + "px";
          var height = ((d.boundingPoly.vertices[2].y - d.boundingPoly.vertices[0].y) * multiplier) + "px";
          
          // Store this in the data object for use later
          d.multiplier = multiplier;
          d.home = {
            left: left,
            top: top
          };

          // Draw the faces on the faces layer
          var img = $("<img/>", {
                "src": d.iiifFaceImageURL,
                "id": "face-" + id + "-" + i,
                "class": "draggable face",
                "data-x": left,
                "data-y": top})
            .css({"transform" : "translate(" + left + "px," + top + "px)"});
          $(img).data("info", d);
          $(regions).append(img);

          // Draw the faces info on the faces layer
          var imgInfo = $("<div/>", {"class": "info"})
            .css({"transform" : "translate(" + left + "px," + (top-20) + "px)"})
            .html(d.iiifFaceImageURL);
          $(regions).append(imgInfo);

          // Draw the black out boxes on the mask layer
          var box = $("<div/>", {
              "class": "blackout",
              "width": width,
              "height": height})
            .css({"transform" : "translate(" + left + "px," + top + "px)"});
          $(mask).append(box);
        });
      }

      var textAnnotations = image.googlevision.responses[0].textAnnotations; 
      if (textAnnotations) {
        var textGroup = svgContainer.append("g")
                  .attr("id", "textgroup-" + id);
        
        var texts = textGroup.selectAll("polygon")
                    .data(textAnnotations)
                    .enter()
                    .append("polygon");

        texts.attr("points", verticesToPolygonPoints)
                                  .attr("stroke", "blue")
                                  .attr("stroke-width", 2)
                                  .attr("fill", "none");

        // var textLabels = textGroup.selectAll("text")
        //            .data(textAnnotations)
        //            .enter()
        //            .append("text");

        // textLabels.text(function(d) {return d.description;})
        //            .attr("x", function(d) {return d.boundingPoly.vertices[0].x;})
        //                    .attr("y", function(d) {return d.boundingPoly.vertices[0].y;})
        //                      .attr("font-family", "sans-serif")
        //                      .attr("font-size", "20px")
        //                    .attr("fill", "red");

        textAnnotations.forEach(function(d, i) {
          if (i>0) {
            var left = (d.boundingPoly.vertices[0].x * multiplier);
            var top = (d.boundingPoly.vertices[0].y * multiplier);
            var width = ((d.boundingPoly.vertices[1].x - d.boundingPoly.vertices[0].x) * multiplier) + "px";
            var height = ((d.boundingPoly.vertices[2].y - d.boundingPoly.vertices[0].y) * multiplier) + "px";
            
            // Store this in the data object for use later
            d.multiplier = multiplier;

            // Draw the texts on the text layer
            var img = $("<img/>", {
                  "src": d.iiifTextImageURL,
                  "class": "draggable text",
                  "data-x": left,
                  "data-y": top})
              .css({"transform" : "translate(" + left + "px," + top + "px)"});
            $(regions).append(img);

            // Draw the black out boxes on the mask layer
            var box = $("<div/>", {
                "class": "blackout",
                "width": width,
                "height": height})
              .css({"transform" : "translate(" + left + "px," + top + "px)"});
            $(mask).append(box);          
          }
        });
      }     
    }   
  }

  return container;
}