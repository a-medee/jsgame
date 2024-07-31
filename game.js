const radius = 69;
const speed = 1000;
const BULLET_SPEDD = 2000;
const bullet_radius = 40;
const bullet_lifetime = 0.5;
const Enemy_Radius = radius;
const Enemy_Color = "#0000ff";
const Enemy_Speed = 500 / 3;
const PARTICLE_COUNT = 100;
const PARTICLE_MAG = BULLET_SPEDD;
const PARTICLE_RADIUS = 10;
const PARTICLE_LIFETIME = 0.5;
const PARTICLE_COLOR = "#27408b";
const ENEMY_SPAWN_COOLDOWN = 1.0;
const ENEMY_SPAWN_DISTANCE = 1500.0;

class Particle
{
   constructor(pos, vel, lifetime, rdius)
    {
	this.pos = pos;
	this.vel = vel;
	this.lifetime = lifetime;
	this.rdius = rdius;
    }

    update (dt)
    {
	this.pos = this.pos.add(this.vel.scale(dt));
	this.lifetime -= dt; 
    }
    render (context)
    {
	fillCircle(context, this.pos, this.rdius, PARTICLE_COLOR);

    }
}


function polarBall(mag, dir)
{
    return new Ball(Math.cos(dir) * mag, Math.sin(dir) * mag);
}

function particul_burst(particles, center)
{
    for(let i = 0; i < PARTICLE_COUNT; ++i)
    {
	particles.push(new Particle(center,
				    polarBall(Math.random() * PARTICLE_MAG, Math.random() * 2 * Math.PI),
				    Math.random() * PARTICLE_LIFETIME,
				    Math.random() * PARTICLE_RADIUS));
    }
}

class Enemy
{
    constructor(pos)
    {
	this.pos = pos;
	this.dead = false;
    }

    update(dt, playerPos)
    {
	let vel = playerPos.sub(this.pos)
	    .normalise().scale(Enemy_Speed * dt);
	this.pos = this.pos.add(vel);
    }

    render(context)
    {
	fillCircle(context, this.pos, Enemy_Radius, Enemy_Color);
    }
}

class Bullet
{
    constructor(pos, vel)
    {
	this.pos = pos;
	this.vel = vel;
	this.bullet_lifetime = bullet_lifetime;
    }

    update(dt)
    {
	this.pos = this.pos.add(this.vel.scale(dt));
	this.bullet_lifetime -= dt;
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

    len()
    {
	return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalise()
    {
	const sire = this.len();
	return new Ball(this.x / sire, this.y / sire);
    }

    dist(that)
    {
	return this.sub(that).len();
    }
}
const directionsMap = {
    "KeyO": new Ball(0, 1.0),
    "KeyP": new Ball(0, -1.0),
    "KeyB": new Ball(-1.0, 0),
    "KeyD": new Ball(1.0, 0)
}

const TutorialState = Object.freeze({
    "LearningMovement": 0,
    "LearningShooting": 1,
    "Finished": 2,
});

const TutorialMessages = Object.freeze([
    "OPDB to move", "Click to shoot circles", ""
]);

class TutorialPopup
{
    constructor(text)
    {
	this.alpha = 0.0;
	this.dalpha = 0.0;
	this.text = text;
	this.onFadedIn = undefined;
	this.onFadedOut = undefined;
    }

    update(dt)
    {
	this.alpha += this.dalpha * dt;

	if (this.dalpha < 0.0 && this.alpha <= 0.0)
	{
	    this.alpha = 0.0;
	    this.dalpha = 0.0;

	    if (this.onFadedOut !== undefined)
	    {
		this.onFadedOut();
	    }
	} else if (this.dalpha > 0.0 && this.alpha >= 1.0) {
	    this.dalpha = 0.0;
	    this.alpha = 1.0;

	    if (this.onFadedIn !== undefined)
	    {
		this.onFadedIn();
	    }
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
    }

    fadeOut()
    {
	this.dalpha = -1.0;
    }
}

class Tutorial
{
    constructor()
    {
	this.state = 0;
	this.popup = new TutorialPopup(TutorialMessages[this.state]);
	this.popup.fadeIn();
	this.popup.onFadedOut = () => {
	    this.popup.text = TutorialMessages[this.state];
	    this.popup.fadeIn();
	}
    }

    update(dt)
    {
	this.popup.update(dt);
    }

    render(context)
    {
	this.popup.render(context);
    }

    playerMoved()
    {
	if (this.state == TutorialState.LearningMovement)
	{
	    this.popup.fadeOut();
	    this.state += 1;
	}
    }

    playerShot()
    {
	if (this.state == TutorialState.LearningShooting)
	{
	    this.popup.fadeOut();
	    this.state += 1;
	}
    }
}


function renderEntity(entities, context)
{
    for (let entity of entities)
    {
	entity.render(context)
    }
}
class Game
{
    constructor()
    {
	this.pos = new Ball(radius + 10, radius + 10);
	this.tutorial = new Tutorial();
	this.vel = new Ball(0, 0);
	this.player_moved_text = false;
	this.mousePos = new Ball(0, 0);
	this.bullets = [];
	this.ennemies = [];
	this.particles = [];
	this.moved = false;
	this.enemySpawnRate = ENEMY_SPAWN_COOLDOWN;
	this.enemySpawnCooldown = this.enemySpawnRate;
    }

    update(dt)
    {
	this.pos = this.pos.add(this.vel.scale(dt));
	this.tutorial.update(dt);

	for (let ennemy of this.ennemies)
	{
	    for (let bullet of this.bullets)
	    {
		if (!ennemy.dead && ennemy.pos.dist(bullet.pos) <= Enemy_Radius + radius)
		{
		    ennemy.dead = true;
		    bullet.bullet_lifetime = 0.0;
		    particul_burst(this.particles, ennemy.pos);
		}
	    }
	}
	if (this.moved)
	{
	    this.tutorial.playerMoved();
	}
	for (let bullet of this.bullets)
	{
	    bullet.update(dt);
	}

	for (let ennemy of this.ennemies)
	{
	    ennemy.update(dt, this.pos);
	}

	for (let particle of this.particles)
	{
	    particle.update(dt);
	}
	this.bullets = this.bullets.filter((bullet) => bullet.bullet_lifetime > 0.0);
	this.ennemies = this.ennemies.filter((enemy) => !enemy.dead);
	this.particles = this.particles.filter((particle) => particle.lifetime > 0.0)

	if (this.tutorial.state == TutorialState.Finished)
	{
	    this.enemySpawnCooldown -= dt;
	    if (this.enemySpawnCooldown <= 0.0)
	    {
		this.spawnEnemy();
		this.enemySpawnCooldown = this.enemySpawnRate;
		this.enemySpawnRate = Math.max(0.01, this.enemySpawnRate - 0.01);
	    }
	}
    }

    render(context)
    {
	const widht = (canvas.width = window.innerWidth);
	const height = (canvas.height = window.innerHeight);

	context.clearRect(0, 0, widht, height);
	this.tutorial.render(context);

	renderEntity(this.bullets, context);
	renderEntity(this.ennemies, context);
	renderEntity(this.particles, context);
	
	fillCircle(context, this.pos, radius, "red");
    }

    spawnEnemy()
    {
	let dir = Math.random() * 2 * Math.PI;
	this.ennemies.push(new Enemy(this.pos.add(polarBall(ENEMY_SPAWN_DISTANCE, dir))));
    }
    keyDown(event)
    {
	if (event.code in directionsMap)
	{
	    //this.vel = new Ball(0, 0); add this if ball runs to fast
	    this.moved = true;
	    this.vel = this.vel.add(directionsMap[event.code].scale(speed));
	}
    }

    keyUp(event)
    {
	if (event.code in directionsMap)
	{
	    this.moved = true;
	    this.vel = this.vel.sub(directionsMap[event.code].scale(speed));
	}
    }

    mouseDown(event)
    {
	this.tutorial.playerShot();
	const mousePos =  new Ball(event.offsetX, event.offsetY);
	const bulletVet = mousePos.sub(this.pos).normalise().scale(BULLET_SPEDD);
	this.bullets.push(new Bullet(this.pos, bulletVet));
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
