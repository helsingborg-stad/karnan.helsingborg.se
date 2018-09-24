<?php

namespace Karnan\Theme;

class Filters
{
    public function __construct()
    {

        // Social media icons
        add_filter('wp_nav_menu_items', array($this, 'addSocialIconsToMenu'), 20, 2);
        add_filter('Municipio/main_menu/items', array($this, 'addSocialIconsToMenu'), 10, 2);

        // Nav tooltip
        add_filter('wp_nav_menu_items', array($this, 'navigationTooltip'), 15, 2);

        //Heeader styling
        add_filter('acf/load_value/name=header_layout', array($this, 'forceJumboHeader'), 10, 3);

        //Filter header data
        add_filter('Municipio/viewData', array($this, 'filterHbgBladeData'), 10, 1);

        //Set custom classes to timeline module
        add_filter('Modularity/Module/Classes', array($this, 'timelineClasses'), 10, 3);

        //Set custom attributes to timeline module
        add_filter('Modularity/Module/Attributes', array($this, 'timelineAttributes'), 10, 3);
    }

    /**
     * Set data attribute to timeline module
     * @param  array $attributes   The attributes (array)
     * @param  string $moduleType  The module type
     * @param  array $sidebarArgs  The sidebar's args
     * @return array               Modified array of classes
     */
    public function timelineAttributes($attributes, $moduleType, $sidebarArgs)
    {
        if ($moduleType == 'mod-timeline') {
            $attributes[] = 'data-animation="animate fadeInUp"';
        }

        return $attributes;
    }

    /**
     * Set custom classes to timeline module
     * @param  array $classes      The classes (array)
     * @param  string $moduleType  The module type
     * @param  array $sidebarArgs  The sidebar's args
     * @return array               Modified array of classes
     */
    public function timelineClasses($classes, $moduleType, $sidebarArgs)
    {
        if ($moduleType == 'mod-timeline') {
            $classes[] = 'js-reveal-animation';
        }

        return $classes;
    }

    /**
     * Set tooltip top for nav items
     * @param  string   $items  The HTML list content for the menu items
     * @param  stdClass $args   An object containing wp_nav_menu() arguments
     * @return string           Modified nav string
     */
    public function navigationTooltip($items, $args = null)
    {
        $pattern = '/(data-tooltip="[^"]+")/i';
        $items = preg_replace($pattern, '$1 data-tooltip-top ', $items);

        return $items;
    }

    /**
     * Adds social icons to menu from settings page
     * @return string - New markup for menu
     */

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
            $items .= '<li class="menu-item-social hidden-md"><a href="' . $icon['link'] . '"><span data-tooltip="' . $icon['tooltip'] .'" data-tooltip-top>' . $svg . '</span></a></li>' . "\n";
        }

        return $items ."</ul>";
    }

    /**
     * Force the setting of jumbo header whatever the selected header is.
     * @return void
     */

    public function forceJumboHeader($value, $postId, $field)
    {
        if ($postId != 'option' && $postId != 'options') {
            return $value;
        }
        return 'jumbo';
    }

    /**
     * Append class to the header that removes the js-overlay functionality.
     * @return array - Containing view data
     */

    public function filterHbgBladeData($data)
    {
        if (isset($data['headerLayout']) && isset($data['headerLayout']['classes'])) {
            $data['headerLayout']['classes'] .= " nav-no-overflow";
        }

        return $data;
    }
}
