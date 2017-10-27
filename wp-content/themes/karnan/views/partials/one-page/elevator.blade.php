@if (is_array($sections) && !empty($sections))
    <ul id="one-page-elevator">
    @foreach ($sections as $elevatorKey => $elevatorItem)
        <li data-tooltip="{{ $elevatorItem['section_title'] }}" data-tooltip-right class="elevator-item @if($elevatorKey == 0) is-first @endif @if($elevatorKey == count($sections)-1) is-last @endif ">
            <a href="#{{ sanitize_title($elevatorItem['section_title']) }}">
                <span class="blipper blipper-theme-1"></span>
                <span class="blipper-disabled"></span>
                <span class="height-indicator">{{ $elevatorItem['height_indicator'] }}<?php _e("m", 'karnan'); ?></span>
            </a>
        </li>
    @endforeach
    </ul>
@endif
