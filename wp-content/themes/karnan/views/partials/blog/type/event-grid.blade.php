<?php
global $post;

$thumbnail = municipio_get_thumbnail_source(
    $post->ID,
    array(500, 500)
);

$columnSize = \karnan\Controller\Archive::getColumnSize();
?>
<div class="{{ $columnSize }}">
    <a href="{{ the_permalink() }}" class="box box-post-brick <?php echo $grid_alter ? 'brick-columns-' . $gridSize . '"' : ''; ?>" data-equal-item>

        @if ($thumbnail)
        <div class="box-image" {!! $thumbnail ? 'style="background-image:url(' . $thumbnail . ');"' : '' !!}>
            <img src="{{ municipio_get_thumbnail_source(null,array(500,500)) }}" alt="{{ the_title() }}">
        </div>
        @else
            <div class="box-image"></div>
        @endif

        <div class="box-content">
            @if (get_field('archive_' . sanitize_title(get_post_type()) . '_feed_date_published', 'option') != 'false')
            <span class="box-post-event-date">
                {{ \Municipio\Helper\Event::formatEventDate($post->start_date, $post->end_date) }}
            </span>
            @endif

            <span class="box-post-event-title">{{ the_title() }}</span>
        </div>

    </a>
</div>
