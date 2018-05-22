var factory = null;
var Height = 0;
var Width = 0;

function init(id){
    factory = new Factory(id)
}

function animate(){
    factory.clear()
    factory.play()

    requestAnimationFrame(animate)
}

function Factory(id){ 
    var canvas = document.getElementById(id);
    this.context = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.workers = []

    this.init()
}

Factory.prototype.clear = function(){
    this.context.clearRect(0,0,this.width,this.height);
}

Factory.prototype.init = function(){
    for(var i=0;i<1;i++){
        this.workers.push(new Worker(this.context,100,100,20,20,1,1,1,1))
    }
}

Factory.prototype.play = function(){
    for(var i=0;i<this.workers.length;i++){
        this.workers[i].update()
    }
}

function Worker(context,x,y,title,number,baseColor,scale,startAngle,speed){
    this.context = context;
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.width = 280 * this.scale;
    this.height = 380 * this.scale;
    this.title = title;
    this.number = number;
    this.startAngle = 0 //startAngle;
    this.baseColor = baseColor;
    this.gapAngle = 0.01;
    this.cacheArr = {}
    this.gapL = 40;
    this.size = 100;

    this.width = Math.sqrt(Math.pow(this.size,2)-Math.pow(this.size/2,2))*2
    this.height = this.size/2 * 3
    this.halfX = this.width/2
    this.halfY = this.size/2
    this.rgbArr = [0.2,0.5,1]
    this.pointR = [16,16,16]
}

Worker.prototype.draw = function(){
    this.drawTriangle(0);
    this.drawTriangle(1);
    this.drawTriangle(2);

    this.drawPoint(0);
    this.drawPoint(1);
    this.drawPoint(2);
}

Worker.prototype.update = function(){
    this.startAngle += this.gapAngle;
    this.draw()
}

Worker.prototype.utils = (function(){
    return {
        miniAngle: function(ang){
            var angle = ang;
            while(ang > Math.PI*2){
                ang = ang - Math.PI*2
            }
            while(ang < -Math.PI*2){
                ang = ang + Math.PI*2
            }
            return ang
        }
    }
})()

Worker.prototype.drawTriangle = function(index){
    if(!this.cacheArr['angle'+index]){
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        var size = 100 * this.scale;
        var dig = Math.PI/3 * 4;
        var pointsArr = [];
        var lineArr = []
        
        for(var i=0;i<3;i++){
            var x = Math.sin(dig*i);
            var y = Math.cos(dig*i);

            pointsArr.push({x:x*size+this.halfX*this.scale,y:y*size+this.halfY*this.scale})
        }

        console.log(pointsArr)

        for(var i=0;i<pointsArr.length;i++){
            var point = pointsArr[i];
            var nextPoint;
            if(i < pointsArr.length -1){
                nextPoint= pointsArr[i+1]
            } else {
                nextPoint = pointsArr[0]
            }

            var grad = Math.atan((point.y - nextPoint.y) / (point.x-nextPoint.x))
            var length = Math.sqrt(Math.pow((point.x - nextPoint.x),2)+Math.pow((point.y-nextPoint.y),2))
            var gX = Math.abs(Math.cos(grad))
            var gY = Math.abs(Math.sin(grad))

            var startXIsBigger = point.x > nextPoint.x ? true : false
            var startYIsBigger = point.y > nextPoint.y ? true : false;

            var point1X = startXIsBigger ? point.x - this.gapL*this.scale*gX : point.x + this.gapL*this.scale*gX;
            var point1Y = startYIsBigger ? point.y - this.gapL*this.scale*gY : point.y + this.gapL*this.scale*gY;
            var point2X = startXIsBigger ? point.x - (length-this.gapL)*this.scale*gX : point.x + (length-this.gapL)*this.scale*gX;
            var point2Y = startYIsBigger ? point.y - (length-this.gapL)*this.scale*gY : point.y + (length-this.gapL)*this.scale*gY;

            var point1 = {x:point1X,y:point1Y}
            var point2 = {x:point2X,y:point2Y}

            lineArr.push({point1:point1,point2:point2})
        }

        ctx.save();
        ctx.shadowBlur=10;
        ctx.shadowColor="rgba(20, 161, 233," + this.rgbArr[index]+')'
        ctx.fillStyle = "rgba(20, 161, 233," + this.rgbArr[index]+')';
        ctx.moveTo(lineArr[0].point1.x,lineArr[0].point1.y)
        ctx.beginPath();

        for(var i=0;i<lineArr.length;i++){
            if(i == lineArr.length -1){
                ctx.lineTo(lineArr[i].point1.x,lineArr[i].point1.y);
                ctx.lineTo(lineArr[i].point2.x,lineArr[i].point2.y);
                ctx.lineTo(lineArr[0].point1.x,lineArr[0].point1.y);
            } else if(i == 0){
                ctx.lineTo(lineArr[i].point2.x,lineArr[i].point2.y);
            } else {
                ctx.lineTo(lineArr[i].point1.x,lineArr[i].point1.y);
                ctx.lineTo(lineArr[i].point2.x,lineArr[i].point2.y);
            }
        }

        ctx.closePath()
        ctx.fill()
        ctx.restore()

        for(var i=0;i<pointsArr.length;i++){
            var point = pointsArr[i]
            var point1 = pointsArr[(i+1)%3]
            var point2 = pointsArr[(i+2)%3]
            var centerX = (point1.x + point2.x)/2
            var centerY = (point1.y + point2.y)/2

            var length = Math.sqrt(Math.pow((point.x-centerX),2)+Math.pow((point.y-centerY),2))
            var grad = Math.atan((point.y-centerY)/(point.x-centerX))
            var gX = Math.abs(Math.cos(grad))
            var gY = Math.abs(Math.sin(grad))
            var isXBigger = point.x > centerX ? true : false
            var isYBigger = point.y > centerY ? true : false

            var X = isXBigger ? point.x - 45*gX : point.x + 45*gX;
            var Y = isYBigger ? point.y - 45*gY : point.y + 45* gY; 

            ctx.save()
            ctx.beginPath()
            ctx.shadowBlur=10;
            ctx.shadowColor="rgba(20, 161, 233," + this.rgbArr[index]+')';
            ctx.fillStyle = "rgba(20, 161, 233," + this.rgbArr[index]+')'
            ctx.arc(X,Y,23,0,Math.PI*2)
            ctx.fill()
            ctx.closePath()
            ctx.restore()
        }
        this.cacheArr['angle'+index] = ctx
    }
    var cache =  this.cacheArr['angle'+index]

    this.context.save()
    var rotateAngle = this.utils.miniAngle(index* 2*Math.PI/18+this.startAngle)
    this.context.translate(this.halfX,this.halfY+30)
    this.context.rotate(rotateAngle)
    this.context.drawImage(cache.canvas, 0,0,this.width,this.height,-this.halfX,-this.halfY,this.width,this.height);
    this.context.restore()
}

Worker.prototype.drawPoint = function(index){
    if(!this.cacheArr['point'+index]){
        var canvas = document.createElement("canvas");
        canvas.width = 300*this.scale
        canvas.height = 300*this.scale
        var ctx = canvas.getContext("2d");

        var gx = Math.sin(Math.PI/3*4*index)
        var gy = Math.cos(Math.PI/3*4*index)

        var posX = gx*(this.size*1.2)+this.halfX*this.scale*1.2//+Math.random(this.pointR[index]);
        var posY = gy*(this.size*1.2)+this.halfY*this.scale*1.2//+Math.random(this.pointR[index]); 

        console.log(posX,posY)

        ctx.save()
        ctx.beginPath()
        ctx.shadowColor="rgba(20, 161, 233,"+Math.random(1)+")";
        console.log(posX,posY)        
        ctx.arc(posX,posY,this.pointR[index],0,Math.PI*2)
        ctx.fill()
        ctx.closePath()
        ctx.restore()

        this.cacheArr['point'+index] = ctx;
    }
    var cache =  this.cacheArr['point'+index]

    this.context.save()
    var rotateAngle = this.utils.miniAngle(Math.PI*4/18*index+this.startAngle)
    this.context.translate(this.halfX+0*this.scale,this.halfY+30*this.scale)
    this.context.rotate(rotateAngle)
    this.context.drawImage(cache.canvas, 0,0,cache.canvas.width,cache.canvas.width,-this.halfX-30*this.scale,-this.halfY-30*this.scale,this.width-this.halfX-30*this.scale,this.height-this.halfY-30);
    this.context.restore()
}