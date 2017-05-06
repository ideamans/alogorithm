'use strict';

const Express = require('express'),
  Trianglify  = require('trianglify'),
  Svg2Png     = require('svg2png'),
  Path        = require('path'),
  Fs          = require('fs'),
  _           = require('lodash'),
  Jsdom       = require('jsdom'),
  Jsyaml      = require('js-yaml');

const { JSDOM } = Jsdom;

const Settings = {
  templateDir: process.env.TEMPLATE_DIR || 'template',
  maxSize: parseInt(process.env.MAX_SIZE || 2400),
  seedPrefix: process.env.SEED_PREFIX || "ideaman's",
  seedDelimiter: process.env.SEED_DELIMITER || ' ',
  svgDeclaration: process.env.SVG_DECLARATION || `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
`,
  cellSizeRate: parseFloat(process.env.CELL_SIZE_RATE || 0.375),
  trianglifyDefaultOptions: {},
  optionsDefaults: {
    type: process.env.DEFAULT_TYPE || 'square',
  },
};

const Logos = Jsyaml.safeLoad(Fs.readFileSync(Path.format({dir: Settings.templateDir, base: 'logos.yml'})));

class HttpException extends Error {
  constructor(message, status=500) {
    super(messaage);
    this.status = status;
  }
}

class Logo {
  constructor(opts={}) {
    // 基本属性
    this.opts = _.defaultsDeep(opts, Settings.optionsDefaults);
    this.logo = Logos[this.opts.type];
    if ( !this.logo ) throw new HttpException('Logo type not found.', 404);
    this.template = Path.format({dir: Settings.templateDir, name: this.opts.type, ext: '.svg'});
    this.seed = _.compact([Settings.seedPrefix, this.opts.phrase]).join(Settings.delimiter);

    // ロゴテンプレートとサイズ計算
    let base = this.logo.base,
      mark = this.logo.mark,
      rate = 1;

    if ( this.opts.width && parseInt(this.opts.width) > 0 ) {
      rate = parseFloat(this.opts.width) / base.width;
    } else if ( this.opts.height && parseInt(this.opts.height) > 0 ) {
      rate = parseFloat(this.opts.height) / base.height;
    }

    if ( rate != 1 ) {
      base.width = Math.round(base.width * rate);
      base.height = Math.round(base.height * rate);
    }
  }

  markSvg() {
    // TrianglifyによるマークSVGを生成
    let mark = this.logo.mark;
    let opts = _.defaultsDeep({
      width: mark.width,
      height: mark.height,
      seed: this.seed,
    }, Settings.trianglifyDefaultOptions);

    // セルサイズはロゴのサイズに応じて調整
    if ( Settings.cellSizeRate > 0 ) {
      opts.cell_size = mark.width * Settings.cellSizeRate;
    }

    // Trianglifyを生成
    let pattern = Trianglify(opts);
    let svg = pattern.svg({
      includeNamespace: true,
    });

    return Promise.resolve(svg);
  }

  logoSvg() {
    // テンプレート
    return JSDOM.fromFile(this.template);
  }

  renderSvg() {
    // テンプレートとTrianglifyによるマークを計算
    return Promise.all([
      this.logoSvg(),
      this.markSvg(),
    ]).then((svgs) => {
      let logo = svgs[0],
        mark = svgs[1],
        doc = logo.window.document;

      // テンプレート中のロゴマークをTrianglifyによるマークに差し替え
      let ref = doc.getElementById('logo-mark');
      ref.outerHTML = mark.outerHTML;

      // SVG要素を取得し、widthとheightを設定
      let elements = doc.getElementsByTagName('svg'),
        svg = elements[0];
      svg.setAttribute('width', this.logo.base.width);
      svg.setAttribute('height', this.logo.base.height);

      // SVG要素を渡す
      return Promise.resolve(svg);
    });
  }

  renderPng() {
    // テンプレートをレンダリングしたSVG
    return this.renderSvg()
      .then((svg) => {
        let base = this.logo.base;
        // PNGファイルに変換
        return Svg2Png(
          new Buffer(Settings.svgDeclaration + svg.outerHTML),
          { witdh: base.width, height: base.height }
        );
      });
  }
}

// Expressを起動
let app = Express();
let server = app.listen(3000);

app.get('/:type.svg', (req, res, next) => {
  // クエリーパラメータを元にロゴを作成
  let opts = _.merge({}, req.params, req.query),
    logo = new Logo(opts);

  // SVG
  logo.renderSvg().then((svg) => {
    console.log(svg.outerHTML);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(Settings.svgDeclaration + svg.outerHTML);
    next();
  });
});

app.get('/:type.png', (req, res, next) => {
  // クエリーパラメータを元にロゴを作成
  let opts = _.merge({}, req.params, req.query),
    logo = new Logo(opts);

  // PNG
  logo.renderPng().then((png) => {
    res.setHeader('Content-Type', 'image/png');
    res.send(png);
    next();
  });
});
