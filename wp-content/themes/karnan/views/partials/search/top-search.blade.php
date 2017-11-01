<?php
    global $searchFormNode;
    $searchFormNode = ($searchFormNode) ? $searchFormNode+1 : 1;
?>
<div class="search-top {!! apply_filters('Municipio/desktop_menu_breakpoint','hidden-sm') !!}" id="search">
    <button type="button" class="btn btn-plain pricon pricon-close toggle-search-top"><?php _e('Close', 'karnan'); ?></button>

    <form method="get" action="{{ home_url() }}">
        <label for="searchkeyword-{{ $searchFormNode }}">{{ get_field('search_placeholder_text', 'option') ? get_field('search_placeholder_text', 'option') : 'What are you looking for?' }}</label>
        <div class="input-group input-group-lg">
            <input id="searchkeyword-{{ $searchFormNode }}" autocomplete="off" class="form-control form-control-lg" type="search" name="s" value="<?php echo (!empty(get_search_query())) ? get_search_query() : ''; ?>">
            <span class="input-group-addon-btn">
                <input type="submit" class="btn btn-primary btn-lg" value="{{ get_field('search_button_text', 'option') ? get_field('search_button_text', 'option') : __('Search', 'municipio') }}">
            </span>
        </div>
    </form>
</div>
