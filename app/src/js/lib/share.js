const title = 'Can you afford to live here?';
const shareURL = encodeURIComponent('http://gu.com/p/46mqa'); // TODO: short url
const hashTag = '#UnaffordableCountry';

const twitterBaseUrl = 'https://twitter.com/intent/tweet?text=';
const facebookBaseUrl = 'https://www.facebook.com/sharer/sharer.php?ref=responsive&u=';
const googleBaseUrl = 'https://plus.google.com/share?url=';

export default function share(network, extra='') {
    var twitterMessage = `${extra}${title} ${hashTag}`;
    var shareWindow;

    if (network === 'twitter') {
        shareWindow = twitterBaseUrl + encodeURIComponent(twitterMessage + ' ') + shareURL;
    } else if (network === 'facebook') {
        shareWindow = facebookBaseUrl + shareURL;
    } else if (network === 'email') {
        shareWindow = 'mailto:?subject=' + encodeURIComponent(title) + '&body=' + shareURL;
    } else if (network === 'google') {
        shareWindow = googleBaseUrl + shareURL;
    }

    window.open(shareWindow, network + 'share', 'width=640,height=320');
}
