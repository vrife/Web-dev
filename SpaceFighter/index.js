//https://www.youtube.com/watch?v=eI9idPTT0c4

//Create the canvas, its 2-dimensional context, and change its 
//dimensions
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d')
canvas.width = innerWidth;
canvas.height = innerHeight;

//Identify the HTML of the score-bar, score-board, board-score, and start-button
const barScore = document.querySelector('#barScoreID')
const startGameBtn = document.querySelector('#startBtn')
const scoreBoard = document.querySelector('#scoreBoard')
const boardScore = document.querySelector('#boardScoreID')

class Player {
    //Give this player the passed-in x, y, radius, and color
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }
    //Draw the player as a circle arc a distance of the specified radius 
    //from the specified x and y coordinates as a starting point with
    //the given color
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill()
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity

    }
    //Draw the projectile as a cirlce arc a distance of the specified radius 
    //from the specified x and y coordinates as a starting point with
    //the given color
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill()
    }

    //Update the x and y position of the projectile by velocity unit
    update() {
        this.draw()
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity

    }
    //Draw the projectile as a cirlce arc a distance of the specified radius 
    //from the specified x and y coordinates as a starting point with
    //the given color
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill()
    }

    //Update the x and y position of the projectile by velocity unit
    update() {
        this.draw()
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}

const friction = 0.99
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }
    //Draw the projectile as a cirlce arc a distance of the specified radius 
    //from the specified x and y coordinates as a starting point with
    //the given color
    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }

    //Update the x and y position of the projectile by velocity unit
    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x += this.velocity.x
        this.y += this.velocity.y
        this.alpha -= 0.01
    }
}

//Make the player's x and y be in the middle of the canvas
const x = canvas.width/2
const y = canvas.height/2

//Make a white player in the middle of the screen with radius 30
//and give the player a list of projectiles it fired
let player = new Player(x, y, 10, 'white');
let projectiles = []
let enemies = []
let particles = []

//Set the starting settings of the game
function init() {
    player = new Player(x, y, 10, 'white');
    projectiles = []
    enemies = []
    particles = []
    score = 0
    barScore.innerHTML = score
    boardScore.innerHTML = score
}

//Spawn enemies of various sizes, colors, and origins every 1000 milliseconds
//to attack the player
function spawnEnemies() {
    setInterval(() => {
        //Make the enemy's radius a random value from 8 to 30, make the 
        //color green, and leave x/y mutable
        const radius = Math.random() * (30-8) + 8
        const color = `hsl(${Math.random()*360}, 50%, 50%)`
        let x 
        let y 
        //Make the chance half and half that the enemy come from the sides
        //or the ceilings
        if (Math.random() < 0.5) {
            //If from the sides, fix x but randomize the y coordinate
            x = Math.random()<0.5 ? (0-radius) : (canvas.width+radius)
            y = Math.random() * canvas.height
        }
        else {
            //If from the ceilings, fix y but randomize the x coordinate
            x = Math.random() * canvas.width
            y = Math.random()<0.5 ? (0-radius) : (canvas.height+radius)
        }
        //Calculate the angle between the spawn point and the middle 
        //of the screen
        const angle = Math.atan2(
            (canvas.height/2) - y, 
            (canvas.width/2) - x
        )
        //Calcualte the velocity using x = cos(angle), y = sin(angle)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        //Put the new enemy in the enemies array and time them to appear
        //every 1000 seconds (around 1 minute)
        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 2000)
}

let animationID
let score = 0
//Constantly anmimate new frames of the game
function animate() {
    //Recursively call the method before clearing the previous frame 
    //and drawing over it with the new locations of everything
    animationID = requestAnimationFrame(animate)
    //The way we clear the screen here gives it a fade factor of 0.1
    c.fillStyle = 'rgba(0,0,0, 0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()
    //If the particle's opacity is <= 0, eliminate it. Otherwise, update it
    particles.forEach((particle, pa_index) => {
        if (particle.alpha <= 0) {
            particles.splice(pa_index, 1)
        }
        else {
            particle.update()
        }
    })
    //Update the projectile according to the new frame and if it goes 
    // past the screen limits, eliminate it
    projectiles.forEach((proj, p_index) => {
        proj.update()
        if (proj.x + proj.radius < 0 || proj.x - proj.radius > canvas.width ||
            proj.y + proj.radius < 0 || proj.y-proj.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(p_index, 1)
            }, 0)
        }
    })
    //Update the enemy according to the new frame. If it hits the player,
    //end the game. If the player hits it, update accordingly
    enemies.forEach((enemy, e_index) => {
        //Update the enemy location and for each projectile..
        enemy.update()

        //If an enemy hits the player, end the game
        dist = Math.hypot((player.x-enemy.x), (player.y-enemy.y))
        if ((dist-player.radius-enemy.radius) <= 0) {
            cancelAnimationFrame(animationID)
            scoreBoard.style.display = 'flex'
            boardScore.innerHTML = score
        }

        //If a projectile hits an enemy, eliminate the projectile and
        //impact the enemy size
        projectiles.forEach((proj, p_index) => {
            //If the distance from the closest point on the projectile 
            //to the closest point on the enemy is less than or = to 0..
            dist = Math.hypot((proj.x-enemy.x), (proj.y-enemy.y))
            if ((dist-enemy.radius-proj.radius) <= 0) {
                //Make a set of fragment particles of different sizes and
                //directions depending on how big the enemy hit was
                for (let i = 0; i < enemy.radius*2; i++) {
                    particles.push(new Particle(proj.x, proj.y, Math.random()*2, 
                    enemy.color, {
                            x: (Math.random() - 0.5) * (Math.random()*5), 
                            y: (Math.random() - 0.5) * (Math.random()*5)
                        }
                    ))
                }
                //If, after reducing the enemy size by 10, it is still greater
                //than 8, subtract its size by 10 and fade the projectile out
                if (enemy.radius-10 >= 8) {
                    //Increase score for non-eliminating hit
                    score += 100
                    barScore.innerHTML = score

                    //Tween shrink the enemy using GSAP
                    gsap.to(enemy, {
                        radius: enemy.radius-10
                    })
                     setTimeout(() => {
                        projectiles.splice(p_index, 1)
                    }, 0)
                }
                //Otherwise, if the enemy's size is < 10 after reducing the
                //enemy size, fade both it and the projectile out
                else{
                    //Increase score for an eliminating hit
                    score += 250
                    barScore.innerHTML = score
                    setTimeout(() => {
                        enemies.splice(e_index, 1)
                        projectiles.splice(p_index, 1)
                    }, 0)
                }
            }
        })

    })
}

// For each click, spawn a new projectile to move in its direction
addEventListener('click', (event) => {
    //Calculate the angle from the center of the screen to the position 
    //clicked in radians using atan2(quadrant height, quadrant width)
    const angle = Math.atan2(
        event.clientY-(canvas.height/2), 
        event.clientX-(canvas.width/2)
    )
    //Calcualte the velocity using x = cos(angle), y = sin(angle)
    const velocity = {
        x: Math.cos(angle) * 4,
        y: Math.sin(angle) * 4
    }
    //Add this generated projectile to the projectile list 
    projectiles.push(new Projectile(canvas.width/2, canvas.height/2, 5, 'white', velocity))
})

// Start the game once the start button is clicked
startGameBtn.addEventListener('click', () => {
    init()
    animate()
    spawnEnemies()
    scoreBoard.style.display = 'none'
})