function computeIfAbsent(map, key, func) {
    var value = map.get(key);
    if (value !== undefined)
      return value;
  
    var newValue = func(key);
    if (newValue !== undefined)
      map.set(key, newValue);
  
    return newValue;
  }