function computeIfAbsent(map, key, func) {
  var value = map.get(key);
  if (value !== undefined)
    return value;

  var newValue = func(key);
  if (newValue !== undefined)
    map.set(key, newValue);

  return newValue;
}

class Rule {
  constructor(ruleJson) {
    this.id = ruleJson.id

    // inputs
    this.firstElementType = ruleJson.start.first.type
    this.firstElementTag = ruleJson.start.first.idTag
    this.firstLinks = new Map()
    ruleJson.start.first.links.forEach(l => this.firstLinks.set(l.ruleIdTag, l.elementId))

    this.secondElementType = ruleJson.start.second.type
    this.secondElementTag = ruleJson.start.second.idTag
    this.secondLinks = new Map()
    ruleJson.start.second.links.forEach(l => this.secondLinks.set(l.ruleIdTag, l.elementId))

    // outputs
    this.resultingFirstElementType = ruleJson.end.first.type
    this.resultingFirstLinks = new Map()
    ruleJson.end.first.links.forEach(l => this.resultingFirstLinks.set(l.first, [l.Id, l.second]))

    this.resultigSecondElementType = ruleJson.end.second.type
    this.resultingSecondLinks = new Map()
    ruleJson.end.second.links.forEach(l => this.resultingSecondLinks.set(l.first, [l.Id, l.second]))
  }

  isMatch(first, second) {
    return first.type === this.firstElementType && second.type === this.secondElementType
  }

  apply(matter, first, second) {
    first.type = this.resultigFirstElementType
    second.type = this.resultigSecondElementType

    matter.add.joint(first, second, 95, 0.99);
  }
}  