// Aplica el efecto hover estándar a un objeto Text de Phaser interactivo:
// rojo y escala 1.2 al pasar el puntero, blanco y escala 1 al salir.
export function aplicarHover(btn) {
    btn.on('pointerover', () => {
        btn.setStyle({ color: '#FF0000' });
        btn.setScale(1.2);
    });
    btn.on('pointerout', () => {
        btn.setStyle({ color: '#ffffff' });
        btn.setScale(1);
    });
}
