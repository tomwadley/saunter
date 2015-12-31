define('saunter/panoMode', [
  'jquery',
  'saunter/model'
],
function ($, model) {

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

    $mainImg.find('.pano').remove();
    var $container = $('<div class="img pano active"></div>');
    $mainImg.append($container);

    var vFOV = 45;

    var PSV = new PhotoSphereViewer({
      panorama: getImageUrl(uiState.img),
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
      tilt_down_max: 0,
      default_position: {
        long: uiState.initAngle + 'deg'
      }
    });
    var updateFunc = getUpdatePano(uiState.targets, vFOV, $targets, $container);
    PSV.addAction('position-updated', function(e) {updateFunc(e.longitude * 180 / Math.PI);});
    PSV.addAction('ready', function() {updateFunc(uiState.initAngle);});

    $targets.find('.target').off().remove();
    $.each(uiState.targets, function(i, target) {
      var $target = $('<div class="target target' + i + '"></div>');
      $targets.append($target);
      $target.on('click', function() {
        var newPos = new model.Position(target.dest_x, target.dest_y, target.angle);
        setPosition(newPos, map, getImageUrl);
      });
    });
    $targets.on('mousedown', '.target', function(e) {
      var event = new MouseEvent('mousedown', e.originalEvent)
      $container.find('div > div').get(0).dispatchEvent(event);
    });
  }

  function getUpdatePano(targets, vFOV, $targets, $container) {
    return function(angle) {
      $.each(targets, function(i, target) {
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
