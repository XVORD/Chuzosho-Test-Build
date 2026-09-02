<?php
declare(strict_types=1);

function chuzosho_react_assets(): void {
    $theme_dir = get_template_directory();
    $theme_uri = get_template_directory_uri();
    $css_files = glob($theme_dir . '/dist/assets/*.css') ?: [];
    $js_files = glob($theme_dir . '/dist/assets/*.js') ?: [];

    foreach ($css_files as $file) {
        wp_enqueue_style('chuzosho-react-' . md5($file), $theme_uri . '/dist/assets/' . basename($file), [], filemtime($file));
    }
    foreach ($js_files as $file) {
        wp_enqueue_script('chuzosho-react-' . md5($file), $theme_uri . '/dist/assets/' . basename($file), [], filemtime($file), true);
        wp_add_inline_script('chuzosho-react-' . md5($file), 'window.CHUZOSHO_THEME_URI = ' . wp_json_encode($theme_uri) . ';', 'before');
        add_filter('script_loader_tag', static function (string $tag, string $handle) use ($file): string {
            return str_contains($handle, md5($file)) ? str_replace(' src=', ' type="module" src=', $tag) : $tag;
        }, 10, 2);
    }
}
add_action('wp_enqueue_scripts', 'chuzosho_react_assets');

// Let React handle client-side routes such as /solutions/isld/.
add_action('template_redirect', static function (): void {
    if (is_404() && !is_admin()) {
        status_header(200);
        include get_template_directory() . '/index.php';
        exit;
    }
});
