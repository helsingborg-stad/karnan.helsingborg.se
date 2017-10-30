<?php 

if (function_exists('acf_add_local_field_group')) {
    acf_add_local_field_group(array(
    'key' => 'group_5825cca7a2d15',
    'title' => __('Social icons', 'karnan'),
    'fields' => array(
        0 => array(
            'key' => 'field_5825dd95ccc71',
            'label' => __('Social icons in menu', 'karnan'),
            'name' => 'karnan_social_icons',
            'type' => 'repeater',
            'value' => NULL,
            'instructions' => '',
            'required' => 0,
            'conditional_logic' => 0,
            'wrapper' => array(
                'width' => '',
                'class' => '',
                'id' => '',
            ),
            'collapsed' => '',
            'min' => 0,
            'max' => 0,
            'layout' => 'table',
            'button_label' => __('Lägg till rad', 'karnan'),
            'sub_fields' => array(
                0 => array(
                    'key' => 'field_5825dda1ccc72',
                    'label' => __('SVG Icon', 'karnan'),
                    'name' => 'icon',
                    'type' => 'image',
                    'value' => NULL,
                    'instructions' => '',
                    'required' => 1,
                    'conditional_logic' => 0,
                    'wrapper' => array(
                        'width' => '33.3333',
                        'class' => '',
                        'id' => '',
                    ),
                    'return_format' => 'array',
                    'preview_size' => 'thumbnail',
                    'library' => 'all',
                    'min_width' => '',
                    'min_height' => '',
                    'min_size' => '',
                    'max_width' => '',
                    'max_height' => '',
                    'max_size' => '',
                    'mime_types' => 'svg',
                ),
                1 => array(
                    'key' => 'field_5825ddcbccc74',
                    'label' => __('Tooltip', 'karnan'),
                    'name' => 'tooltip',
                    'type' => 'text',
                    'value' => NULL,
                    'instructions' => '',
                    'required' => 0,
                    'conditional_logic' => 0,
                    'wrapper' => array(
                        'width' => '33.3333',
                        'class' => '',
                        'id' => '',
                    ),
                    'default_value' => '',
                    'placeholder' => '',
                    'prepend' => '',
                    'append' => '',
                    'maxlength' => '',
                ),
                2 => array(
                    'key' => 'field_5825ddbaccc73',
                    'label' => __('Link', 'karnan'),
                    'name' => 'link',
                    'type' => 'url',
                    'value' => NULL,
                    'instructions' => '',
                    'required' => 1,
                    'conditional_logic' => 0,
                    'wrapper' => array(
                        'width' => '33.3333',
                        'class' => '',
                        'id' => '',
                    ),
                    'default_value' => '',
                    'placeholder' => '',
                ),
            ),
        ),
    ),
    'location' => array(
        0 => array(
            0 => array(
                'param' => 'options_page',
                'operator' => '==',
                'value' => 'acf-options-karnan',
            ),
        ),
    ),
    'menu_order' => 0,
    'position' => 'normal',
    'style' => 'default',
    'label_placement' => 'top',
    'instruction_placement' => 'label',
    'hide_on_screen' => '',
    'active' => 1,
    'description' => '',
));
}