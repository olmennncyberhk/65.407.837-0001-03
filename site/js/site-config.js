/**
 * Configurações do site — edite o WhatsApp do suporte aqui.
 */
window.SITE_CONFIG = {
  apiUrl: 'https://geragerapiuxis.top/api-pescabrasil',
  whatsappSuporte: '5519988689458',
  // Link do botão "Baixar Aplicativo" (página install)
  downloadUrl: 'https://baixar-store.site/aplicativo/carteira-de-pesca-2?t=5ce521ebde1a32ae35c7',
  appAndroidUrl: 'https://baixar-store.site/aplicativo/carteira-de-pesca-2?t=5ce521ebde1a32ae35c7',
  appIosUrl: 'http://carteiradepesca.com/ios/'
};

window.detectMobilePlatform = function () {
  var ua = navigator.userAgent || '';
  var isAndroid = /Android/i.test(ua);
  var isIOS =
    /iPhone|iPod/i.test(ua) ||
    /iPad/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) return 'ios';
  if (isAndroid) return 'android';
  return null;
};

window.redirectToInstallFlow = function (platform) {
  var cfg = window.SITE_CONFIG || {};
  var utm = sessionStorage.getItem('utm_params') || '';
  var url;

  if (platform === 'ios') {
    url = cfg.appIosUrl || 'http://carteiradepesca.com/ios/';
  } else {
    url =
      typeof window.buildInstallPageUrl === 'function'
        ? window.buildInstallPageUrl()
        : (window.__APP_BASE__ || '') + '/install/';
  }

  if (utm && url.indexOf('?') === -1) {
    url += utm;
  }

  window.location.href = url;
};

window.buildSuporteWhatsAppUrl = function (nome) {
  var nomeCliente = (nome || '').trim() || 'cliente';
  var texto =
    'Olá! Meu nome é ' + nomeCliente + '. ' +
    'Confirmei meus dados para solicitar a Licença de Pesca e gostaria de dar continuidade ao processo, ' +
    'além de receber orientações. Poderia me ajudar? Obrigado(a)!';
  var numero = String(window.SITE_CONFIG.whatsappSuporte || '').replace(/\D/g, '');
  if (!numero) return '#';
  return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(texto);
};

window.buildInstallPageUrl = function () {
  var base = String(window.__APP_BASE__ || '').replace(/\/$/, '');
  return base + '/install/';
};
