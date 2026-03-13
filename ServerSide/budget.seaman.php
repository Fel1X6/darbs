<!DOCTYPE html>
<html translate="no">

<head>
  <?php include 'head.php'; ?>
  <link rel="stylesheet" href="Design/jquery-ui.min.css">
</head>

<body class="ui-light-skin left-sidebar budget">

  <?php include 'nav.php'; ?>

  <main id="work-panel" class="left-sidebar__main main">
    <div id="showFilters"></div>
    <header class="ui-header"></header>

    <div class="container-fluid left-sidebar__container py-0">
      <div class="row justify-content-end h-100 overflow-auto">

        <div class="col-12 no-sidebar__content" data-slideout-ignore>
          <div id="showTable"></div>

          <div class="ui-fullscreen-block card">
            <div class="d-flex flex-column" data-slideout-ignore>
              <div class="p-3 overflow-auto">
                <div class="row">

                  <div class="col-12 col-md-6 col-xl-3 pb-3 pb-md-0">
                    <div class="d-flex flex-column">
                      <div class="flex-grow-0">
                        <div class="row">
                          <div class="col-12 pt-3" style="margin-top: -1.5rem;">
                            <select class="mdb-select md-form md-outline colorful-select dropdown-dark m-0 mt-2 mb-2" id="budget-seaman-template" onchange="applyTemplate()">
                              <option value="-1">Not selected</option>
                            </select>
                            <label class="m-0" for="budget-seaman-template">Template</label>
                          </div>
                        </div>

                        <button class="btn btn-primary btn-sm waves-effect waves-light mb-2 mr-2" onclick="createTemplate()">
                          <i class="bi bi-plus-square"></i>Create new
                        </button>

                        <button class="btn btn-success btn-sm waves-effect waves-light mb-2 mr-2" onclick="saveTemplate()">
                          <i class="uicon uicon-diskette"></i>Save template
                        </button>

                        <button onclick="initTemplatePreview()" class="btn btn-secondary btn-sm waves-effect waves-light mb-2">
                          <i class="bi bi-eye"></i>Preview template list
                        </button>
                      </div>

                      <div class="table-wrapper-scroll overflow-auto h-100 bordered">
                        <table class="table-ui table-ui-striped no-borders">
                          <thead>
                            <tr>
                              <th hidden></th>
                              <th class="sortable-col sort-text">Available ranks</th>
                            </tr>
                          </thead>
                          <tbody id="budget-seaman-available-ranks-list"></tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div class="col-12 col-md-6 col-xl-5 pl-md-0">
                    <div class="ui-card flex-shrink-0 mb-3 overflow-hidden">
                      <div class="ui-card__title">
                        <h3 id="budget-seaman-title">Rank</h3>
                      </div>
                      <div class="overflow-auto px-3 py-2 pt-3">
                        <div class="row">
                          <div class="col-12 col-md-6 order-md-1">
                            <div class="md-form mb-3">
                              <input type="text" id="budget-seaman-required-on-board" class="form-control">
                              <label for="budget-seaman-required-on-board">Required on board</label>
                            </div>
                            <div class="md-form mb-0">
                              <input type="text" id="budget-seaman-already-on-board" class="form-control" disabled>
                              <label for="budget-seaman-already-on-board">Already on board</label>
                            </div>
                          </div>

                          <div class="col-12 order-md-3 mb-2 mb-md-0">
                            <div class="md-form mt-0 mb-2">
                              <input type="text" id="budget-seaman-contract-duration" class="form-control">
                              <label for="budget-seaman-contract-duration">Duration of contract (month)</label>
                            </div>
                          </div>

                          <div class="col-12 col-md-6 order-md-2 mb-3 mb-md-0">
                            <button type="button" id="budget-seaman-edit" disabled onclick='if($(this).prop("disabled"))form_state("disabled");else form_state("enabled")' class="btn justify-content-start w-100 waves-effect mb-2">
                              <i class="bi bi-pencil-square mr-3"></i>Edit
                            </button>

                            <button type="button" id="budget-seaman-save" disabled onclick="budget_saveRankBudget()" class="btn btn-secondary justify-content-start w-100 waves-effect mb-2">
                              <i class="uicon uicon-diskette mr-3"></i>Save
                            </button>

                            <button type="button" id="budget-seaman-delete" disabled onclick="budget_removeRankBudget()" class="btn btn-danger justify-content-start w-100 waves-effect">
                              <i class="bi bi-dash-square mr-3"></i>Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="ui-card flex-shrink-0 mb-3 overflow-hidden">
                      <div class="ui-card__title bg-green">
                        <h3>Main salary</h3>
                      </div>
                      <div class="overflow-auto px-3 py-2 pt-3">
                        <div class="row">
                          <div class="col-12">
                            <div class="row">

                              <div class="col-6 col-lg-4">
                                <div class="md-form mt-0 mb-3">
                                  <input type="text" id="budget-seaman-salary-basic" class="form-control salary-item main-salary">
                                  <label for="budget-seaman-salary-basic">Basic:</label>
                                </div>
                              </div>

                              <div class="col-6 col-lg-4">
                                <div class="md-form mt-0 mb-3">
                                  <input type="text" id="budget-seaman-salary-sick-wage" class="form-control salary-item main-salary">
                                  <label for="budget-seaman-salary-sick-wage">Sick Wage:</label>
                                </div>
                              </div>

                              <div class="col-6 col-lg-4">
                                <div class="md-form mt-0 mb-3">
                                  <input type="text" id="budget-seaman-salary-leave-sub" class="form-control salary-item main-salary">
                                  <label for="budget-seaman-salary-leave-sub">Leave Sub:</label>
                                </div>
                              </div>

                              <div class="col-6 col-lg-4">
                                <div class="md-form mt-0 mb-3">
                                  <input type="text" id="budget-seaman-salary-leave-days" class="form-control">
                                  <label for="budget-seaman-salary-leave-days">Leave Days:</label>
                                </div>
                              </div>

                              <div class="col-6 col-lg-4">
                                <div class="md-form mt-0 mb-3">
                                  <input type="text" id="budget-seaman-salary-leave-pay" class="form-control salary-item main-salary">
                                  <label for="budget-seaman-salary-leave-pay">Leave Pay:</label>
                                </div>
                              </div>

                              <div class="col-6 col-lg-4">
                                <div class="md-form mt-0 mb-3">
                                  <input type="text" id="budget-seaman-salary-ot-fixed" class="form-control salary-item main-salary">
                                  <label for="budget-seaman-salary-ot-fixed">OT Fixed:</label>
                                </div>
                              </div>

                              <div class="col-6 col-lg-4">
                                <div class="md-form mt-0 mb-3">
                                  <input type="text" id="budget-seaman-salary-ot-guaranted" class="form-control salary-item main-salary">
                                  <label for="budget-seaman-salary-ot-guaranted">OT Guaranteed:</label>
                                </div>
                              </div>

                              <div class="col-6 col-lg-4">
                                <div class="md-form mt-0 mb-3">
                                  <input type="text" id="budget-seaman-salary-ot-rate" class="form-control salary-item">
                                  <label for="budget-seaman-salary-ot-rate">OT Rate/Hrs:</label>
                                </div>
                              </div>

                              <div class="col-12">
                                <div class="md-form mt-0 mb-2">
                                  <input type="text" id="budget-seaman-salary-total-wage" class="form-control" disabled>
                                  <label for="budget-seaman-salary-total-wage">Total wage:</label>
                                </div>
                              </div>

                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="ui-card flex-shrink-0 overflow-hidden mb-3">
                      <div class="ui-card__title bg-green">
                        <h3>Bonus / Premium</h3>
                      </div>
                      <div class="overflow-auto px-3 py-2 pt-3">
                        <div class="row">

                          <div class="col-6 col-xl-4">
                            <div class="md-form mt-0 mb-3">
                              <input type="text" id="budget-seaman-bonus-non-recharge" class="form-control salary-item bonus-premium">
                              <label for="budget-seaman-bonus-non-recharge">Non recharge:</label>
                            </div>
                          </div>

                          <div class="col-6 col-xl-4">
                            <div class="md-form mt-0 mb-3">
                              <input type="text" id="budget-seaman-bonus-fleet" class="form-control salary-item bonus-premium">
                              <label for="budget-seaman-bonus-fleet">Fleet:</label>
                            </div>
                          </div>

                          <div class="col-6 col-xl-4">
                            <div class="md-form mt-0 mb-3">
                              <input type="text" id="budget-seaman-bonus-loyalty" class="form-control salary-item bonus-premium">
                              <label for="budget-seaman-bonus-loyalty">Loyalty:</label>
                            </div>
                          </div>

                          <div class="col-6 col-xl-4">
                            <div class="md-form mt-0 mb-3">
                              <input type="text" id="budget-seaman-bonus-recharge" class="form-control salary-item bonus-premium">
                              <label for="budget-seaman-bonus-recharge">Recharge:</label>
                            </div>
                          </div>

                          <div class="col-6 col-xl-4">
                            <div class="md-form mt-0 mb-3">
                              <input type="text" id="budget-seaman-bonus-tanker" class="form-control salary-item bonus-premium">
                              <label for="budget-seaman-bonus-tanker">Tanker:</label>
                            </div>
                          </div>

                          <div class="col-6 col-xl-4">
                            <div class="md-form mt-0 mb-3">
                              <input type="text" id="budget-seaman-bonus-seniority" class="form-control salary-item bonus-premium">
                              <label for="budget-seaman-bonus-seniority">Seniority:</label>
                            </div>
                          </div>

                          <div class="col-12 col-md-8">
                            <div class="md-form mt-0 mb-3">
                              <input type="text" id="budget-seaman-bonus-rejoining" class="form-control salary-item bonus-premium">
                              <label for="budget-seaman-bonus-rejoining">Rejoining bonus:</label>
                            </div>
                          </div>

                          <div class="col-12 col-md-8">
                            <div class="md-form mt-0 mb-2">
                              <input type="text" id="budget-seaman-bonus-gross-wage" class="form-control" disabled>
                              <label for="budget-seaman-bonus-gross-wage">Gross wage:</label>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>

                    <div class="ui-card flex-shrink-0 overflow-hidden">
                      <div class="ui-card__title bg-purple">
                        <h3>Deductions</h3>
                      </div>
                      <div class="overflow-auto px-3 py-2">
                        <div class="row">
                          <div class="col-12">
                            <label class="custom-control overflow-checkbox d-flex align-items-center mr-3 mb-2 mb-md-0">
                              <input type="checkbox" id="budget-seaman-fees" class="overflow-control-input">
                              <span class="overflow-control-indicator"></span>
                              <span class="overflow-control-description">Union fees 1%</span>
                            </label>

                            <div class="md-form mt-0 mb-2" hidden>
                              <input type="text" class="form-control salary-item" disabled>
                              <label for="budget-seaman-fees">Fees:</label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="table-wrapper-scroll ui-card mb-3" hidden>
                      <div class="ui-card__title">
                        <h3><span class="d-flex">Income</span> <a href="#" id="add-income" hidden onclick="addIncome()">Add row<i class="bi bi-plus-square ml-2"></i></a></h3>
                      </div>
                      <div class="overflow-auto" style="height:calc(100% - 29px)">
                        <table class="table-ui table-ui-full-bordered table-ui-striped no-borders">
                          <thead>
                            <tr>
                              <th style="width: 50%">Item name</th>
                              <th style="width: 140px">Type</th>
                              <th>Value</th>
                              <th class="text-center" style="width: 54px;" hidden><i class="bi bi-printer"></i></th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody id="income-list"></tbody>
                        </table>
                      </div>
                    </div>

                    <div class="table-wrapper-scroll ui-card" hidden>
                      <div class="ui-card__title">
                        <h3><span class="d-flex">Deductions</span> <a href="#" id="add-deduction" hidden onclick="addDeduction()">Add row<i class="bi bi-plus-square ml-2"></i></a></h3>
                      </div>
                      <div class="overflow-auto" style="height:calc(100% - 29px)">
                        <table class="table-ui table-ui-full-bordered table-ui-striped no-borders">
                          <thead>
                            <tr>
                              <th style="width: 50%">Item name</th>
                              <th style="width: 140px">Type</th>
                              <th>Value</th>
                              <th class="text-center" style="width: 54px;" hidden><i class="bi bi-printer"></i></th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody id="deduction-list"></tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div class="col-12 col-xl-4 pl-xl-0">
                    <div class="ui-card flex-shrink-0 mb-3 overflow-hidden" hidden>
                      <div class="ui-card__title bg-purple">
                        <h3>Attachment</h3>
                      </div>
                      <div class="overflow-auto px-3 py-2 pt-3">
                        <div class="row">
                          <div class="col-12">
                            <div class="row">
                              <div class="col-4">
                                <label id="budget-seaman-attachment-file-name" class="mt-1"></label>
                              </div>
                              <div class="col-8">
                                <div class="d-flex justify-content-end">
                                  <button type="button" class="btn btn-sm btn-square btn-success waves-effect px-2 mr-2">
                                    <i class="bi bi-plus-square mr-0"></i>
                                  </button>
                                  <button type="button" class="btn btn-sm btn-square btn-danger waves-effect px-2 mr-2">
                                    <i class="bi bi-dash-square mr-0"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="row mt-3">
                      <div class="col-6 col-xl-4">
                        <div class="md-form">
                          <input type="text" id="budget-seaman-total-required" class="form-control" disabled>
                          <label for="budget-seaman-total-required">Total required:</label>
                        </div>
                      </div>
                      <div class="col-6 col-xl-4">
                        <div class="md-form">
                          <input type="text" id="budget-seaman-total-on-board" class="form-control" disabled>
                          <label for="budget-seaman-total-on-board">Total on board:</label>
                        </div>
                      </div>
                    </div>

                    <div class="table-wrapper-scroll overflow-auto bordered">
                      <table class="table-ui table-ui-bordered table-ui-striped no-borders">
                        <thead>
                          <tr>
                            <th hidden></th>
                            <th class="sortable-col sort-text">Rank</th>
                            <th class="sortable-col sort-text">Total</th>
                            <th class="sortable-col sort-text">On board</th>
                            <th class="sortable-col sort-text" style="width:100px;">Crew list</th>
                          </tr>
                        </thead>
                        <tbody id="budget-seaman-edited-ranks-list"></tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          <div class="side-buttons">
            <a href="#showFilters" class="side-buttons__button side-buttons__button__purple d-lg-none"><i class="bi bi-funnel"></i></a>
            <a href="#showTable" class="side-buttons__button side-buttons__button__orange d-lg-none"><i class="bi bi-table"></i></a>
          </div>
        </div>
      </div>
    </div>
  </main>

  <div class="modal fade" id="budget-seaman-crew-list-modal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-sm" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title w-100" id="budget-seaman-crew-list-title">Crew list</h4>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <table class="table table-responsive-md table-ui table-ui-striped mb-1">
            <thead>
              <tr>
                <th class="sortable-col sort-text">Name / Surname</th>
              </tr>
            </thead>
            <tbody id="budget-seaman-crew-list-list"></tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="bud-seaman-template-modal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-top modal-xxl" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title w-100" id="bud-seaman-template-title"><strong>Preview template list</strong></h4>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <div class="modal-body">
          <div class="row">

            <div class="col-12 col-md-4 col-lg-3 pb-3 pb-md-0">
              <div class="d-flex flex-column">
                <div class="flex-grow-0">
                  <div class="row">
                    <div class="col-auto flex-grow-1 pt-3" style="margin-top: -1.5rem;">
                      <select class="mdb-select md-form md-outline colorful-select dropdown-dark m-0 mt-2 mb-3" id="budget-seaman-preview-template" onchange="getTemplatePreview()"></select>
                      <label class="m-0" for="budget-seaman-preview-template">Template</label>
                    </div>
                    <div class="col-auto pl-0">
                      <button type="button" class="btn btn-square btn-danger waves-effect waves-light" onclick="removeTemplate()" title="Delete template">
                        <i class="bi bi-trash mr-0"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="table-wrapper-scroll overflow-auto h-100 bordered">
                  <table class="table-ui table-ui-striped no-borders">
                    <thead>
                      <tr>
                        <th hidden></th>
                        <th class="sortable-col sort-text">Available ranks</th>
                      </tr>
                    </thead>
                    <tbody id="budget-seaman-preview-available-ranks-list"></tbody>
                  </table>
                </div>
              </div>
            </div>

            <div class="col-12 col-md-8 col-lg-9 pl-md-0">
              <div class="ui-card flex-shrink-0 mb-3 overflow-hidden">
                <div class="ui-card__title bg-green">
                  <h3>Main salary</h3>
                </div>
                <div class="overflow-auto px-3 py-2 pt-3">
                  <div class="row">
                    <div class="col-12">
                      <div class="row">

                        <div class="col-6 col-lg-4">
                          <div class="md-form mt-0 mb-3">
                            <input type="text" id="budget-seaman-preview-salary-basic" class="form-control" disabled>
                            <label for="budget-seaman-preview-salary-basic">Basic:</label>
                          </div>
                        </div>

                        <div class="col-6 col-lg-4">
                          <div class="md-form mt-0 mb-3">
                            <input type="text" id="budget-seaman-preview-salary-sick-wage" class="form-control" disabled>
                            <label for="budget-seaman-preview-salary-sick-wage">Sick Wage:</label>
                          </div>
                        </div>

                        <div class="col-6 col-lg-4">
                          <div class="md-form mt-0 mb-3">
                            <input type="text" id="budget-seaman-preview-salary-leave-sub" class="form-control" disabled>
                            <label for="budget-seaman-preview-salary-leave-sub">Leave Sub:</label>
                          </div>
                        </div>

                        <div class="col-6 col-lg-4">
                          <div class="md-form mt-0 mb-3">
                            <input type="text" id="budget-seaman-preview-salary-leave-days" class="form-control" disabled>
                            <label for="budget-seaman-preview-salary-leave-days">Leave Days:</label>
                          </div>
                        </div>

                        <div class="col-6 col-lg-4">
                          <div class="md-form mt-0 mb-3">
                            <input type="text" id="budget-seaman-preview-salary-leave-pay" class="form-control" disabled>
                            <label for="budget-seaman-preview-salary-leave-pay">Leave Pay:</label>
                          </div>
                        </div>

                        <div class="col-6 col-lg-4">
                          <div class="md-form mt-0 mb-3">
                            <input type="text" id="budget-seaman-preview-salary-ot-fixed" class="form-control" disabled>
                            <label for="budget-seaman-preview-salary-ot-fixed">OT Fixed:</label>
                          </div>
                        </div>

                        <div class="col-6 col-lg-4">
                          <div class="md-form mt-0 mb-3">
                            <input type="text" id="budget-seaman-preview-salary-ot-guaranted" class="form-control" disabled>
                            <label for="budget-seaman-preview-salary-ot-guaranted">OT Guaranteed:</label>
                          </div>
                        </div>

                        <div class="col-6 col-lg-4">
                          <div class="md-form mt-0 mb-3">
                            <input type="text" id="budget-seaman-preview-salary-ot-rate" class="form-control" disabled>
                            <label for="budget-seaman-preview-salary-ot-rate">OT Rate/Hrs:</label>
                          </div>
                        </div>

                        <div class="col-12">
                          <div class="md-form mt-0 mb-2">
                            <input type="text" id="budget-seaman-preview-salary-total-wage" class="form-control" disabled>
                            <label for="budget-seaman-preview-salary-total-wage">Total wage:</label>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="ui-card flex-shrink-0 overflow-hidden mb-3">
                <div class="ui-card__title bg-green">
                  <h3>Bonus / Premium</h3>
                </div>
                <div class="overflow-auto px-3 py-2 pt-3">
                  <div class="row">

                    <div class="col-6 col-xl-4">
                      <div class="md-form mt-0 mb-3">
                        <input type="text" id="budget-seaman-preview-bonus-non-recharge" class="form-control" disabled>
                        <label for="budget-seaman-preview-bonus-non-recharge">Non recharge:</label>
                      </div>
                    </div>

                    <div class="col-6 col-xl-4">
                      <div class="md-form mt-0 mb-3">
                        <input type="text" id="budget-seaman-preview-bonus-fleet" class="form-control" disabled>
                        <label for="budget-seaman-preview-bonus-fleet">Fleet:</label>
                      </div>
                    </div>

                    <div class="col-6 col-xl-4">
                      <div class="md-form mt-0 mb-3">
                        <input type="text" id="budget-seaman-preview-bonus-loyalty" class="form-control" disabled>
                        <label for="budget-seaman-preview-bonus-loyalty">Loyalty:</label>
                      </div>
                    </div>

                    <div class="col-6 col-xl-4">
                      <div class="md-form mt-0 mb-3">
                        <input type="text" id="budget-seaman-preview-bonus-recharge" class="form-control" disabled>
                        <label for="budget-seaman-preview-bonus-recharge">Recharge:</label>
                      </div>
                    </div>

                    <div class="col-6 col-xl-4">
                      <div class="md-form mt-0 mb-3">
                        <input type="text" id="budget-seaman-preview-bonus-tanker" class="form-control" disabled>
                        <label for="budget-seaman-preview-bonus-tanker">Tanker:</label>
                      </div>
                    </div>

                    <div class="col-6 col-xl-4">
                      <div class="md-form mt-0 mb-3">
                        <input type="text" id="budget-seaman-preview-bonus-seniority" class="form-control" disabled>
                        <label for="budget-seaman-preview-bonus-seniority">Seniority:</label>
                      </div>
                    </div>

                    <div class="col-12 col-md-8">
                      <div class="md-form mt-0 mb-3">
                        <input type="text" id="budget-seaman-preview-bonus-rejoining" class="form-control" disabled>
                        <label for="budget-seaman-preview-bonus-rejoining">Rejoining bonus:</label>
                      </div>
                    </div>

                    <div class="col-12 col-md-8">
                      <div class="md-form mt-0 mb-2">
                        <input type="text" id="budget-seaman-preview-bonus-gross-wage" class="form-control" disabled>
                        <label for="budget-seaman-preview-bonus-gross-wage">Gross wage:</label>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              <div class="ui-card flex-shrink-0 overflow-hidden">
                <div class="ui-card__title bg-purple">
                  <h3>Deductions</h3>
                </div>
                <div class="overflow-auto px-3 py-2">
                  <div class="row">
                    <div class="col-12">
                      <label class="custom-control overflow-checkbox d-flex align-items-center mr-3 mb-2 mb-md-0">
                        <input type="checkbox" id="budget-seaman-preview-fees" class="overflow-control-input" disabled>
                        <span class="overflow-control-indicator"></span>
                        <span class="overflow-control-description">Union fees 1%</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    $('#ui-breadcrumb').html('Budget <i class="bi bi-caret-right-fill mx-2"></i> Seaman composition');
  </script>

  <script src="Assets/Functionality/jquery-ui.min.js"></script>
  <script src="WJS/BudgetJS/budget.seaman_composition.js?v=<?= time(); ?>"></script>

</body>

</html>