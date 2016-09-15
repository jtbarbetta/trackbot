var colors = {
    'yellow': ['banana', 'canary', 'canary'],
    'blue': ['sky', 'ocean', 'berries'],
    'pink': ['cotten candy', 'ballet shoes', 'bubble gum', 'strawberry milkshake'],
    'red' : ['rose', 'nose', 'apple']
};

exports.list = function(req, res) {
    console.log('req: ',req.query);
    //res.send("get color list for: " + (req.query && req.query.color ? req.query.color : ""));
    var color = req.query && req.query.color ? req.query.color : "";
    var list = colors[color] || [];
    res.send(JSON.stringify(list));
};
