<!doctype html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="<?php echo esc_url(get_template_directory_uri() . '/assets/chuzosho-logo-only.png'); ?>">
  <?php wp_head(); ?>
  <?php
  $theme_uri = get_template_directory_uri();
  $dist_dir = get_template_directory() . '/dist/assets/';
  $css = glob($dist_dir . '*.css') ?: [];
  $js = glob($dist_dir . '*.js') ?: [];
  $css = array_values(array_filter($css, static fn($f) => filesize($f) > 0));
  $js = array_values(array_filter($js, static fn($f) => filesize($f) > 0));
  ?>
  <?php if ($css): ?><link rel="stylesheet" href="<?php echo esc_url($theme_uri . '/dist/assets/' . basename($css[0])); ?>">
  <?php endif; ?>
</head>
<body <?php body_class(); ?>>
  <?php wp_body_open(); ?>
  <div id="app-root"></div>
  <?php if ($js): ?><script>window.CHUZOSHO_THEME_URI=<?php echo wp_json_encode($theme_uri); ?>;</script>
  <script type="module" crossorigin src="<?php echo esc_url($theme_uri . '/dist/assets/' . basename($js[0])); ?>"></script>
  <?php endif; ?>
  <?php wp_footer(); ?>
</body>
</html>
