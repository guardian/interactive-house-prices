var mobile = window.innerWidth < 740;

window.addEventListener('resize', () => {
    mobile = window.innerWidth < 740;
});

export default function isMobile() {
    return mobile;
}
