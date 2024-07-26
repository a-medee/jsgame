const radius = 69;
const speed = 1000;
const BULLET_SPEDD = 2000;
const bullet_radius = 40;


class Bullet
{
    constructor(pos, vel)
    {
	this.pos = pos;
	this.vel = vel;
    }

    update(dt)
    {
	this.pos = this.pos.add(this.vel.scale(dt));
    }

    render(context)
    {
	fillCircle(context, this.pos, bullet_radius, "red");
    }
}
class Ball {

    constructor(x, y)
    {
	this.x = x;
	this.y = y;
    }

    add(that)
    {
	return new Ball(this.x + that.x,
			that.y + this.y);
    }
    sub(that)
    {
	return new Ball(this.x - that.x,
			this.y - that.y);
    }

    scale(ball)
    {
	return new Ball(this.x * ball, this.y * ball);
    }

    length()
    {
	return Math.sqrt(this.x * this.x + this.y + this.y);
    }

    normalise()
    {
	const sire = this.length();

	return new Ball(this.x / sire, this.y / sire);
    }

}
const directionsMap = {
	"KeyO": new Ball(0, 1.0),
	"KeyP": new Ball(0, -1.0),
	"KeyB": new Ball(-1.0, 0),
	"KeyD": new Ball(1.0, 0)
}

class TutorialPopup
{
    constructor(text)
    {
	this.alpha = 0.0;
	this.dalpha = 0.0;
	this.text = text;
    }

    update(dt)
    {
	this.alpha += this.dalpha * dt;

	if (this.dalpha < 0.0 && this.alpha <= 0.0)
	{
	    this.alpha = 0.0;
	    this.dalpha = 0.0;
	} else if (this.dalpha > 0.0 && this.alpha >= 1.0) {
	    this.dalpha = 0.0;
	    this.alpha = 1.0;
	}

    }

    render(context)
    {
	const widht = window.innerWidth;
	const height = window.innerHeight;

	context.fillStyle = `rgba(255, 255, 0, ${this.alpha})`;
	context.font = "77px serif";
	context.textAlign = "center"
	context.fillText(this.text, widht / 2, height / 2);

    }

    fadeIn()
    {
	this.dalpha = 1.0;
	this.alpha = 0.0;
    }

    fadeOut()
    {
	this.dalpha = -1.0;
	this.alpha = 1.0;
    }
}

class Game
{
    constructor()
    {
	this.pos = new Ball(radius + 10, radius + 10);
	this.popup = new TutorialPopup("Text for the js");
	this.vel = new Ball(0, 0);
	this.popup.fadeIn();
	this.player_moved_text = false;
	this.mousePos = new Ball(0, 0);
	this.bullets = new Set();
    }

    update(dt)
    {
	this.pos = this.pos.add(this.vel.scale(dt));
	this.popup.update(dt);
	if (!this.player_moved_text && this.vel.length() > 0)
	{
	    this.player_moved_text = true;
	    this.popup.fadeOut();
	}

	for (let bullet of this.bullets)
	{
	    bullet.update(dt);
	}
    }

    render(context)
    {
	const widht = (canvas.width = window.innerWidth);
	const height = (canvas.height = window.innerHeight);

	context.clearRect(0, 0, widht, height);
	this.popup.render(context)
	for (let bullet of this.bullets)
	{
	    bullet.render(context);
	}

	fillCircle(context, this.pos, radius, "red");
    }

    keyDown(event)
    {
	if (event.code in directionsMap)
	{
	    this.vel = this.vel.add(directionsMap[event.code].scale(speed));
	}
    }

    keyUp(event)
    {
	if (event.code in directionsMap)
	{
	    this.vel = this.vel.sub(directionsMap[event.code].scale(speed));
	}
    }

    mouseDown(event)
    {
	const mousePos =  new Ball(event.offsetX, event.offsetY);
	const bulletVet = mousePos.sub(this.pos).normalise().scale(BULLET_SPEDD);
	console.log(BULLET_SPEDD)
	this.bullets.add(new Bullet(this.pos, bulletVet));
    }
}
function fillCircle(context, pos, radius, color = "green")
{
    context.beginPath();
    context.fillStyle = color;
    context.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
    context.fill();
}

(() => {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    const game = new Game();
   
    let start;

    let dt;
    
    function step(timestamp)
    {
	if (start === undefined)
	{
	    start = timestamp;
	}
	dt = (timestamp - start) * 0.001;
	start = timestamp;

	game.update(dt);
	game.render(context);

	window.requestAnimationFrame(step);

    }
    window.requestAnimationFrame(step);

    document.addEventListener("keydown", (event) =>
	{
	    game.keyDown(event);
	});

    document.addEventListener("keyup", (event) =>
	{
	    game.keyUp(event);
	});

    document.addEventListener("mousedown", (event) =>
	{
	    game.mouseDown(event);
	});
}) ();
