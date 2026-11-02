<?php
/** Chuzosho React theme bootstrap. */
add_action('after_setup_theme', static function (): void {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
});

// React owns the front end. Keep WordPress's head/footer hooks available for plugins.
add_action('template_redirect', static function (): void {
    if (is_404() && !is_admin()) {
        status_header(200);
        include get_template_directory() . '/index.php';
        exit;
    }
});

remove_action('wp_head', 'print_emoji_detection_script', 7);
remove_action('wp_print_styles', 'print_emoji_styles');
