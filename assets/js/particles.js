const particlesConfig = {
    particles: {
        number: {
            value: 50,
            density: {
                enable: true,
                value_area: 1800
            }
        },
        color: {
            value: ['#66FCF1', '#45A29E', '#66FCF1']
        },
        shape: {
            type: ['circle', 'triangle'],
            stroke: {
                width: 1,
                color: 'rgba(102, 252, 241, 0.3)'
            },
            polygon: {
                nb_sides: 6
            }
        },
        opacity: {
            value: 0.4,
            random: true,
            anim: {
                enable: true,
                speed: 0.3,
                opacity_min: 0.15,
                sync: false
            }
        },
        size: {
            value: 4,
            random: true,
            anim: {
                enable: true,
                speed: 0.3,
                size_min: 1,
                sync: false
            }
        },
        line_linked: {
            enable: true,
            distance: 180,
            color: '#66FCF1',
            opacity: 0.2,
            width: 1.5
        },
        move: {
            enable: true,
            speed: 0.5,
            direction: 'none',
            random: true,
            straight: false,
            out_mode: 'bounce',
            bounce: true,
            attract: {
                enable: true,
                rotateX: 1500,
                rotateY: 1800
            }
        }
    },
    interactivity: {
        detect_on: 'canvas',
        events: {
            onhover: {
                enable: true,
                mode: ['grab', 'bubble']
            },
            onclick: {
                enable: true,
                mode: 'push'
            },
            resize: true
        },
        modes: {
            grab: {
                distance: 180,
                line_linked: {
                    opacity: 0.3
                }
            },
            bubble: {
                distance: 200,
                size: 6,
                duration: 0.3,
                opacity: 0.2,
                speed: 1
            },
            push: {
                particles_nb: 4
            }
        }
    },
    retina_detect: true
};

particlesJS('particles-js', particlesConfig);
