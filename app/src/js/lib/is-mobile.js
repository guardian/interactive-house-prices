var mobile;

window.addEventListener('resize', () => {
    mobile = window.innerWidth < 740;
});

export default function isMobile() {
    return mobile;
}
