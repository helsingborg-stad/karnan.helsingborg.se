<?php 

if (function_exists('acf_add_local_field_group')) {
    acf_add_local_field_group(array(
    'key' => 'group_59fc5d9c59512',
    'title' => __('Youtube Live Video', 'karnan'),
    'fields' => array(
        0 => array(
            'key' => 'field_5a0c3db4aa9c0',
            'label' => __('Live placeholder', 'karnan'),
            'name' => 'youtube_live_video_placeholder',
            'type' => 'image',
            'value' => NULL,
            'instructions' => '',
            'required' => 0,
            'conditional_logic' => 0,
            'wrapper' => array(
                'width' => '30',
                'class' => '',
                'id' => '',
            ),
            'return_format' => 'id',
            'preview_size' => 'thumbnail',
            'library' => 'all',
            'min_width' => '',
            'min_height' => '',
            'min_size' => '',
            'max_width' => '',
            'max_height' => '',
            'max_size' => '',
            'mime_types' => '',
        ),
        1 => array(
            'key' => 'field_59fc5defae4f9',
            'label' => __('Youtube live video url (full share url)', 'karnan'),
            'name' => 'youtube_live_video_url',
            'type' => 'url',
            'value' => NULL,
            'instructions' => __('A live feed url from the top of the tower', 'karnan'),
            'required' => 0,
            'conditional_logic' => 0,
            'wrapper' => array(
                'width' => '70',
                'class' => '',
                'id' => '',
            ),
            'default_value' => '',
            'placeholder' => __('https://youtube.com/yourvieoid', 'karnan'),
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