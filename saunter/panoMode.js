define('saunter/panoMode', [
  'jquery',
  'saunter/model'
],
function ($, model) {

  var panos = {};
  var currentTargets = [];

  return {
      getUiState: function(pos, map) {
          return new UiState(pos, map);
      },
      render: render
  };

  function UiState(pos, map) {
    this.pos = pos;

    var cell = map.getCell(pos.x, pos.y);
    this.img = cell.pano;
    this.initAngle = pos.direction;
    this.targets = cell.targets
  }

  function render(uiState, map, setPosition, getImageUrl) {
    var $mainImg = $('#mainImg');
    var $targets = $('#targets');

    currentTargets = uiState.targets;

    $targets.find('.target').off().remove();
    $.each(currentTargets, function(i, target) {
      var $target = $('<div class="target target' + i + '"></div>');
      $targets.append($target);

      var targetImg = map.getCell(target.dest_x, target.dest_y).pano;
      preload(targetImg, getImageUrl, $mainImg, $targets);

      $target.on('click', function() {
        var newPos = new model.Position(target.dest_x, target.dest_y, target.angle);
        setPosition(newPos, map, getImageUrl);
      });
    });

    $mainImg.find('.pano').removeClass('active');

    getLoadedPano(uiState.img, function(pano) {
      if (pano != null) {
        activatePano(pano, uiState.initAngle);
      } else {
        console.log("Pano was not preloaded - creating...");
        pano = createPano(uiState.img, getImageUrl, $mainImg, $targets, function(pano) {
          activatePano(pano, uiState.initAngle);
        });
      }

      $targets.on('mousedown', '.target', function(e) {
        var event = new MouseEvent('mousedown', e.originalEvent)
        pano.$container.find('div > div').get(0).dispatchEvent(event);
      });
    });
  }

  function activatePano(pano, angle) {
    pano.PSV.moveTo(angle + 'deg', 0);
    pano.$container.addClass('active');
  }

  function preload(img, getImageUrl, $mainImg, $targets) {
    getLoadedPano(img, function(pano) {
      if (pano == null) {
        createPano(img, getImageUrl, $mainImg, $targets, function(pano) {});
      }
    });
  }

  function getLoadedPano(img, callback) {
    var count = 20;
    poll();
    function poll() {
      if (panos.hasOwnProperty(img)) {
        var pano = panos[img];
        if (!pano.ready) {
          console.log('Pano not ready...');
          count--;
          if (count == 0) {
            console.log('Giving up on pano:' + img);
          } else {
            setTimeout(poll, 200);
          }
        } else {
          callback(pano);
        }
      } else {
        callback(null);
      }
    }
  }

  function createPano(img, getImageUrl, $mainImg, $targets, callback) {
    console.log('Creating pano: ' + img);

    var $container = $('<div class="img pano"></div>');
    $mainImg.append($container);

    var vFOV = 45;

    var PSV = new PhotoSphereViewer({
      panorama: getImageUrl(img),
      container: $container.get(0),
      autoload: true,
      usexmpdata: true,
      allow_user_interactions: true,
      allow_scroll_to_zoon: false,
      time_anim: false,
      navbar: false,
      min_fov: vFOV,
      max_fov: vFOV,
      tilt_up_max: 0,
      tilt_down_max: 0
    });

    var pano = { $container: $container, PSV: PSV, ready: false };

    var updateFunc = getUpdatePano(vFOV, $targets, $container);
    PSV.addAction('position-updated', function(e) {updateFunc(e.longitude * 180 / Math.PI);});
    PSV.addAction('ready', function() {
      pano.ready = true;
      callback(pano);
    });

    panos[img] = pano;

    return pano;
  }

  function getUpdatePano(vFOV, $targets, $container) {
    return function(angle) {
      $.each(currentTargets, function(i, target) {
        var $target = $targets.find('.target.target' + i);

        var width = $container.width();
        var height = $container.height();
        
        var hFOV = getHorizontalFieldOfView(width, height, vFOV);

        var targetPositionPrc = getTargetPositionAsPercentage(angle, hFOV, target.angle);

        if (targetPositionPrc === null) {
          $target.removeClass('active');
        } else {
          var position = targetPositionPrc * width;
          position -= $target.width() / 2
          
          $target.addClass('active');
          $target.css('left', position);
        }
      });
    }
  }

  function getHorizontalFieldOfView(width, height, vFOV) {
    var aspectRatio = width / height;
    var vFOVRadians = vFOV * Math.PI / 180;
    var hFOVRadians = 2 * Math.atan(Math.tan(vFOVRadians / 2 ) * aspectRatio);
    return hFOVRadians * 180 / Math.PI;
  }

  function getTargetPositionAsPercentage(viewAngle, hFOV, targetAngle) {
    start = viewAngle - (hFOV / 2);
    end = viewAngle + (hFOV / 2);

    var f = function(start, end) {
      return function(x) {
        if (x > start && x < end) {
          return x
        }
        return null;
      }
    }(start, end);
    var adjustedTargetAngle = f(targetAngle) || f(targetAngle + 360) || f(targetAngle - 360);

    if (adjustedTargetAngle === null) {
      return null;
    }

    var alpha = end - adjustedTargetAngle;
    var beta = 180 - alpha - ((180 - hFOV) / 2);
    var q = Math.tan((0.5*(alpha - beta)) * (Math.PI / 180)) / Math.tan((0.5*(alpha + beta)) * (Math.PI / 180));
    var d = (q + 1)/(1 - q);
    var screen = 2 * Math.sin((0.5 * hFOV) * (Math.PI / 180));
    return d / screen;
  }
});
