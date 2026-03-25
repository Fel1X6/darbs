<?php
$currentPage = basename($_SERVER['PHP_SELF']);
$username = $_SESSION['usr'] ?? 'User';

$navItems = [
    [
        'file' => 'budget.seaman.php',
        'label' => 'Seaman budget',
        'icon' => 'fa-solid fa-people-group'
    ],
    [
        'file' => '#',
        'label' => 'Budget planning',
        'icon' => 'fa-solid fa-calculator'
    ],
    [
        'file' => '#',
        'label' => 'Reports',
        'icon' => 'fa-solid fa-chart-column'
    ]
];
?>

<aside id="app-nav" class="app-nav">
    <div class="app-nav__top">
        <div class="app-nav__brand">
            <span>Budget</span>
        </div>

        <button type="button" class="app-nav__close" id="app-nav-close" aria-label="Close menu">
            <i class="fa-solid fa-xmark"></i>
        </button>
    </div>

    <div class="app-nav__user-block">
        <div class="app-nav__user-label">User</div>
        <div class="app-nav__user-name"><?= htmlspecialchars($username) ?></div>
    </div>

    <nav class="app-nav__menu">
        <?php foreach ($navItems as $item): ?>
            <?php
            $class = 'app-nav__link';

            if ($currentPage == $item['file']) {
                $class .= ' is-active';
            }
            ?>

            <a href="<?= htmlspecialchars($item['file']) ?>" class="<?= $class ?>">
                <i class="<?= htmlspecialchars($item['icon']) ?>"></i>
                <span><?= htmlspecialchars($item['label']) ?></span>
            </a>
        <?php endforeach; ?>
    </nav>

    <div class="app-nav__bottom">
        <a href="logout.php" class="app-nav__link app-nav__logout">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span>Logout</span>
        </a>
    </div>
</aside>

<header class="app-topbar">
    <button type="button" class="app-topbar__toggle" id="app-nav-open" aria-label="Open menu">
        <i class="fa-solid fa-bars"></i>
    </button>

    <div class="app-topbar__title"><?= htmlspecialchars($pageTitle ?? 'Budget System') ?></div>
    <div class="app-topbar__user"><?= htmlspecialchars($username) ?></div>
</header>

<div id="app-nav-overlay" class="app-nav-overlay"></div>

<script>
document.addEventListener('DOMContentLoaded', function () {
    const nav = document.getElementById('app-nav');
    const overlay = document.getElementById('app-nav-overlay');
    const openBtn = document.getElementById('app-nav-open');
    const closeBtn = document.getElementById('app-nav-close');

    function openNav() {
        nav.classList.add('is-open');
        overlay.classList.add('is-visible');
        document.body.classList.add('nav-open');
    }

    function closeNav() {
        nav.classList.remove('is-open');
        overlay.classList.remove('is-visible');
        document.body.classList.remove('nav-open');
    }

    openBtn.addEventListener('click', openNav);
    closeBtn.addEventListener('click', closeNav);
    overlay.addEventListener('click', closeNav);
});
</script>