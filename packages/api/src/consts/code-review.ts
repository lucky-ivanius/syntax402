export const IGNORE_PATTERNS = [
  // Lock files
  /^.*\.lock$/,
  /^package-lock\.json$/,
  /^yarn\.lock$/,
  /^pnpm-lock\.yaml$/,
  /^bun\.lockb?$/,
  /^Gemfile\.lock$/,
  /^Cargo\.lock$/,
  /^composer\.lock$/,
  /^Pipfile\.lock$/,
  /^poetry\.lock$/,

  // Generated/build directories
  /^dist\//,
  /^build\//,
  /^out\//,
  /^\.next\//,
  /^\.nuxt\//,
  /^\.cache\//,
  /^coverage\//,
  /^node_modules\//,
  /^vendor\//,

  // Generated files
  /\.generated\./,
  /\.min\.js$/,
  /\.min\.css$/,
  /\.bundle\./,
  /^.*-lock\.json$/,

  // Binary and media files
  /\.(png|jpg|jpeg|gif|svg|ico|webp|avif)$/i,
  /\.(woff|woff2|ttf|eot|otf)$/i,
  /\.(mp4|mp3|wav|avi|mov)$/i,
  /\.(pdf|zip|tar|gz|rar|7z)$/i,
  /\.(exe|dll|so|dylib)$/i,

  // IDE and editor files
  /^\.vscode\//,
  /^\.idea\//,
  /\.swp$/,
  /\.swo$/,

  // Documentation that's auto-generated
  /^CHANGELOG\.md$/,
  /^.*\.generated\.md$/,
];
