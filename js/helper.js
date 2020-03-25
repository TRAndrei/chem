function computeIfAbsent(map, key, func) {
  var value = map.get(key);
  if (value !== undefined)
    return value;

  var newValue = func(key);
  if (newValue !== undefined)
    map.set(key, newValue);

  return newValue;
}

function makeJoint(matter, linkType, first, second) {
  var joint = matter.add.joint(first, second, 60, 0.99)

  first.addLink(linkType, second.id, joint)
  second.addLink(linkType, first.id, joint)

  return joint
}

function removeJoint(matter, firstElement, secondElement, jointId) {
  var link = firstElement.gameObject.getLink(jointId, secondElement.gameObject)

  if (link) {
    firstElement.removeLink(jointId, secondElement)
    secondElement.removeLink(jointId, firstElement)

    matter.world.removeConstraint(link[1])
  }
}

class Element extends Phaser.GameObjects.Container {
  constructor(scene, id, type, x, y, maxSpeed) {
    var text = scene.add.text(-10, 5, type, { font: '12px Arial', fill: '#00ff00' });
    var picture = scene.add.image(0, 0, 'element');
    super(scene, x, y, [picture, text]);

    scene.add.existing(this);
    this.setSize(50, 50);

    this.textObj = text
    this.physicsContainer = scene.matter.add.gameObject(this, { shape: { type: 'circle', radius: 25 } });

    this.setFriction(0,0,0).setBounce(1).setMass(1000)
    this.body.inertia = Infinity;
    this.body.inverseInertia = 0
    this.setVelocity(Phaser.Math.Between(-maxSpeed, maxSpeed), Phaser.Math.Between(-maxSpeed, maxSpeed))
    this.links = new Map()
    this.neighbors = new Set()
    this.id = id
  }

  getType() {
    return this.textObj.text
  }

  setType(text) {
    this.textObj.setText(text)
  }

  addLink(linkType, otherElementId, link) {
    computeIfAbsent(this.links, linkType, () => new Array).push([otherElementId, link])
    this.neighbors.add(otherElementId)
  }

  getLink(linkType, otherElement) {
    var typedLinks = this.links.get(linkType)

    if (typedLinks) {
      var otherId = otherElement.id
      for (var idx = 0; idx < typedLinks.size; idx++) {
        if (typedLinks[idx][0] === otherId) {
          return [idx, typedLinks[idx]]
        }
      }
    }
  }

  removeLink(linkType, otherElement) {
    var link = getLink(linkType, otherElement)

    if (link) {
      var typedLinks = this.links.get(linkType)
      typedLinks.splice(link[0], 1)
      this.neighbors.remove(otherElement.id)
    }
  }
}


class Rule {
  constructor(ruleJson) {
    this.id = ruleJson.id

    // inputs
    this.firstTypeStart = ruleJson.firstTypeStart
    this.secondTypeStart = ruleJson.secondTypeStart

    // outputs
    this.firstTypeEnd = ruleJson.firstTypeEnd
    this.secondTypeEnd = ruleJson.secondTypeEnd

    this.makeLink = ruleJson.makeLink
  }

  isMatch(first, second) {
    return first.gameObject.getType() === this.firstTypeStart && second.gameObject.getType() === this.secondTypeStart
  }

  apply(matter, first, second) {
    first.setType(this.firstTypeEnd)
    second.setType(this.secondTypeEnd)

    if (this.makeLink) {
      makeJoint(matter, this.id, first, second)
    }
  }
}  