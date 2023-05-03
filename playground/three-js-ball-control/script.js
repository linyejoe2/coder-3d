"use strict";
// 場景
const scene = new THREE.Scene();
// 相機(field of view: 相機廣角, aspect: 寬高比, near: 多近的東西不渲染, far: 多遠的東西不渲染)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(60, 90, 90); // 相機位置
// camera.position.set(90, 90, 90); // 相機位置
// camera.position.set(115, 1, 65); // 相機位置
camera.lookAt(scene.position); // 相機焦點
// 渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container").appendChild(renderer.domElement);
// 平行光
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(20, 100, 0);
scene.add(light);
// 點光源
const pointLight = new THREE.PointLight(0x2b41a1, 3.5);
pointLight.position.set(5, 100, 100);
scene.add(pointLight);
// 環境光
const ambientLight = new THREE.AmbientLight(0xfae598, 0.6);
scene.add(ambientLight);
class Checkerboard extends THREE.Group {
    constructor() {
        super();
        this.size = 20;
        this.squareSize = 5;
        this.whiteMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff
        });
        this.blackMaterial = new THREE.MeshPhongMaterial({
            color: 0x000000
        });
        for (let x = 0; x < this.size; x++) {
            for (let z = 0; z < this.size; z++) {
                const squareGeometry = new THREE.BoxGeometry(this.squareSize, this.squareSize, this.squareSize);
                const squareMaterial = (x + z) % 2 === 0 ? this.whiteMaterial : this.blackMaterial;
                const square = new THREE.Mesh(squareGeometry, squareMaterial);
                square.position.set((x - this.size / 2) * this.squareSize, 0, (z - this.size / 2) * this.squareSize);
                this.add(square);
            }
        }
    }
}
scene.add(new Checkerboard());
// 建立 cannon.js 场景
const world = new CANNON.World();
world.gravity.set(0, -200, 0);
const groundCM = new CANNON.Material();
const groundShape = new CANNON.Box(new CANNON.Vec3(50, 2.5, 50));
const groundBody = new CANNON.Body({
    mass: 0,
    shape: groundShape,
    material: groundCM
});
// setFromAxisAngle 旋轉 x 軸 -90 度
// groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
world.add(groundBody);
world.addBody(groundBody);
// 添加球體
const sphereRadius = 6;
const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(0, 20, 0);
scene.add(sphere);
const sphereShape = new CANNON.Sphere(sphereRadius);
const sphereCM = new CANNON.Material();
const sphereBody = new CANNON.Body({
    mass: 5,
    position: new CANNON.Vec3(0, 10, 0),
    shape: sphereShape,
    material: sphereCM
});
world.addBody(sphereBody);
const gui = new dat.GUI();
const cameraFolder = gui.addFolder("Camera");
// 控制相機位置
const positionFolder = cameraFolder.addFolder("Position");
positionFolder.add(camera.position, "x", -100, 200, 0.1);
positionFolder.add(camera.position, "y", -100, 200, 0.1);
positionFolder.add(camera.position, "z", -100, 200, 0.1);
// 控制相機觀察點
const lookAtFolder = cameraFolder.addFolder("Look At");
const lookAtTarget = {
    x: 0,
    y: 0,
    z: 0
};
lookAtFolder.add(lookAtTarget, "x", -50, 50, 0.1).onChange(() => {
    camera.lookAt(new THREE.Vector3(lookAtTarget.x, lookAtTarget.y, lookAtTarget.z));
});
lookAtFolder.add(lookAtTarget, "y", -50, 50, 0.1).onChange(() => {
    camera.lookAt(new THREE.Vector3(lookAtTarget.x, lookAtTarget.y, lookAtTarget.z));
});
lookAtFolder.add(lookAtTarget, "z", -50, 50, 0.1).onChange(() => {
    camera.lookAt(new THREE.Vector3(lookAtTarget.x, lookAtTarget.y, lookAtTarget.z));
});
// 創建正方形物件
const boxSize = 10;
const boxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
const boxMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.position.set(20, 10, 0);
scene.add(box);
// 創建正方形物件的物理模型
const boxShape = new CANNON.Box(new CANNON.Vec3(boxSize / 2, boxSize / 2, boxSize / 2));
const boxCM = new CANNON.Material();
const boxBody = new CANNON.Body({
    mass: 2,
    position: new CANNON.Vec3(20, 10, 0),
    shape: boxShape,
    material: boxCM
});
world.addBody(boxBody);
const contactMaterial = new CANNON.ContactMaterial(sphereCM, boxCM, {
    friction: 0.5,
    restitution: 0.5
});
world.addContactMaterial(contactMaterial);
const keyboard = {};
const speed = 0.4;
const jumpSpeed = 5;
// 鍵盤按下事件
document.addEventListener("keydown", (event) => {
    keyboard[event.code] = true;
});
// 鍵盤放開事件
document.addEventListener("keyup", (event) => {
    keyboard[event.code] = false;
});
// 設定渲染循環
function render() {
    requestAnimationFrame(render);
    // 左右(x)
    if (keyboard["KeyA"] || keyboard["KeyD"]) {
        keyboard["KeyA"]
            ? (sphereBody.velocity.x -= speed)
            : (sphereBody.velocity.x += speed);
    }
    else
        sphereBody.velocity.x > 0
            ? (sphereBody.velocity.x -= speed)
            : (sphereBody.velocity.x += speed);
    // 前後(z)
    if (keyboard["KeyW"] || keyboard["KeyS"]) {
        keyboard["KeyW"]
            ? (sphereBody.velocity.z -= speed)
            : (sphereBody.velocity.z += speed);
    }
    else
        sphereBody.velocity.z > 0
            ? (sphereBody.velocity.z -= speed)
            : (sphereBody.velocity.z += speed);
    // 跳躍
    if (keyboard["Space"]) {
        // console.log("Space");
        const v = sphereBody.velocity;
        if (Math.abs(v.y) < 0.1)
            v.y = jumpSpeed;
        console.log(sphereBody.position);
    }
    if (sphereBody.position.y < -1000) {
        sphereBody.velocity.set(0, 0, 0);
        sphereBody.angularVelocity.set(0, 0, 0);
        sphereBody.position.set(0, 20, 0);
        sphereBody.applyForce(new CANNON.Vec3(0, 100, 0), sphereBody.position);
    }
    // sphereBody.addEventListener("collide", function (event) {
    //   console.log("1233");
    //   const { body: bodyA, contact } = event;
    //   if (bodyA === sphereBody && contact) {
    //     const { normal } = contact;
    //     console.log(normal); 
    //     const impulse = 20009;
    //     boxBody.applyImpulse(
    //       new CANNON.Vec3(
    //         normal.x * impulse,
    //         normal.y * impulse,
    //         normal.z * impulse
    //       ),
    //       boxBody.position
    //     );
    //   }
    // });
    world.step(1 / 60);
    box.position.copy(boxBody.position);
    box.quaternion.copy(boxBody.quaternion);
    sphere.position.copy(sphereBody.position);
    sphere.quaternion.copy(sphereBody.quaternion);
    renderer.render(scene, camera);
}
render();