<?php

namespace Karnan\Theme;

class Filters
{
    public function __construct()
    {

        // Social media icons
        add_filter('wp_nav_menu_items', array($this, 'addSocialIconsToMenu'), 10, 2);
        add_filter('Municipio/main_menu/items', array($this, 'addSocialIconsToMenu'), 10, 2);

        //Heeader styling
        add_filter('acf/load_value/name=header_layout', array($this, 'forceJumboHeader'), 10, 3);

        //Filter data
        add_filter('HbgBlade/data', array($this, 'filterHbgBladeData'), 10, 1);
    }

    public function addSocialIconsToMenu($items, $args = null)
    {
        if ($args && $args->theme_location != apply_filters('Municipio/main_menu_theme_location', 'main-menu')) {
            return $items;
        }

        //Not in child (if inherited from main)
        if ($args && (isset($args->child_menu) && $args->child_menu == true) && $args->theme_location == "main-menu") {
            return $items;
        }

        $socialIcons = get_field('karnan_social_icons', 'option');

        if (!is_array($socialIcons)) {
            return $items;
        }

        $items = preg_replace('/\<\/ul\>$/', '', $items);

        foreach ($socialIcons as $icon) {
            $svg = \Municipio\Helper\Svg::extract(get_attached_file($icon['icon']['id']));
            $items .= '<li class="menu-item-social"><a href="' . $icon['link'] . '"><span data-tooltip="' . $icon['tooltip'] .' data-tooltip-top">' . $svg . '</span></a></li>' . "\n";
        }

        return $items ."</ul>";
    }

    public function forceJumboHeader($value, $postId, $field)
    {
        if ($postId != 'option' && $postId != 'options') {
            return $value;
        }
        return 'jumbo';
    }

    public function filterHbgBladeData($data)
    {
        if (isset($data['headerLayout']) && isset($data['headerLayout']['classes'])) {
            $data['headerLayout']['classes'] .= " nav-no-overflow";
        }

        return $data;
    }
}
